const gridSizeInput = document.getElementById('gridSizeInput');
const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');
const showGridCheckbox = document.getElementById('showGrid');
const cppOutput = document.getElementById('cppOutput');
const brushSizeSlider = document.getElementById('brushSize');
const brushSizeLabel = document.getElementById('brushSizeLabel');

let pixels = [];
let history = [];
let currentColor = '#ffffff';
let isDrawing = false;
let currentTool = 'pencil';
let brushSize = 1;

let gridSize = 30;
let pixelSize = 10;

function initPixels() {
    pixels = [];
    for (let y = 0; y < gridSize; y++) {
        pixels[y] = [];
        for (let x = 0; x < gridSize; x++) {
            pixels[y][x] = { r: 0, g: 0, b: 0, a: 0 };
        }
    }
}

function updateCanvasSize() {
    pixelSize = Math.max(4, Math.floor(450 / gridSize));
    canvas.width = gridSize * pixelSize;
    canvas.height = gridSize * pixelSize;
    document.querySelector('.grid-info').textContent = `${gridSize}×${gridSize} pixels (${pixelSize}x zoom)`;
}

function applyGridSize() {
    const newSize = parseInt(gridSizeInput.value);
    if (newSize >= 8 && newSize <= 64) {
        gridSize = newSize;
        updateCanvasSize();
        initPixels();
        render();
    }
}

function setColor(color) {
    currentColor = color;
    document.getElementById('colorWhite').classList.toggle('active', color === '#ffffff');
    document.getElementById('colorBlack').classList.toggle('active', color === '#000000');
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function saveState() {
    history.push(JSON.stringify(pixels));
    if (history.length > 50) history.shift();
}

function undo() {
    if (history.length > 0) {
        pixels = JSON.parse(history.pop());
        render();
    }
}

function render() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const pixel = pixels[y][x];
            if (pixel.a > 0) {
                ctx.fillStyle = `rgba(${pixel.r}, ${pixel.g}, ${pixel.b}, ${pixel.a / 255})`;
                ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
            }
        }
    }

    if (showGridCheckbox.checked) {
        for (let i = 0; i <= gridSize; i++) {
            // Determine line style based on position
            const middle = gridSize / 2;
            const isMiddle = i === Math.floor(middle);
            
            // Calculate quarter and half positions
            const leftQuarter = middle / 2;
            const rightQuarter = middle + (middle / 2);
            
            const isQuarterLine = 
                i === Math.floor(leftQuarter) || 
                i === Math.ceil(leftQuarter) ||
                i === Math.floor(rightQuarter) || 
                i === Math.ceil(rightQuarter);
            
            if (isMiddle) {
                ctx.strokeStyle = 'rgba(102, 126, 234, 0.6)'; // Blue for center
                ctx.lineWidth = 1.5;
            } else if (isQuarterLine) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)'; // Brighter for quarter lines
                ctx.lineWidth = 0.8;
            } else {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'; // Normal grid
                ctx.lineWidth = 0.5;
            }
            
            // Vertical line
            ctx.beginPath();
            ctx.moveTo(i * pixelSize, 0);
            ctx.lineTo(i * pixelSize, canvas.height);
            ctx.stroke();
            
            // Horizontal line
            ctx.beginPath();
            ctx.moveTo(0, i * pixelSize);
            ctx.lineTo(canvas.width, i * pixelSize);
            ctx.stroke();
        }
    }
}

function getPixelCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / pixelSize);
    const y = Math.floor((e.clientY - rect.top) / pixelSize);
    return { x: Math.max(0, Math.min(gridSize - 1, x)), y: Math.max(0, Math.min(gridSize - 1, y)) };
}

function setPixel(x, y) {
    const halfBrush = Math.floor(brushSize / 2);
    for (let dy = -halfBrush; dy <= halfBrush; dy++) {
        for (let dx = -halfBrush; dx <= halfBrush; dx++) {
            const px = x + dx;
            const py = y + dy;
            if (px >= 0 && px < gridSize && py >= 0 && py < gridSize) {
                if (currentTool === 'eraser') {
                    pixels[py][px] = { r: 0, g: 0, b: 0, a: 0 };
                } else {
                    const isWhite = currentColor === '#ffffff';
                    pixels[py][px] = { r: isWhite ? 255 : 0, g: isWhite ? 255 : 0, b: isWhite ? 255 : 0, a: 255 };
                }
            }
        }
    }
}

function floodFill(startX, startY) {
    const targetColor = JSON.stringify(pixels[startY][startX]);
    const isWhite = currentColor === '#ffffff';
    const fillColor = currentTool === 'eraser' 
        ? { r: 0, g: 0, b: 0, a: 0 } 
        : { r: isWhite ? 255 : 0, g: isWhite ? 255 : 0, b: isWhite ? 255 : 0, a: 255 };
    
    if (JSON.stringify(fillColor) === targetColor) return;

    const stack = [[startX, startY]];
    const visited = new Set();

    while (stack.length > 0) {
        const [x, y] = stack.pop();
        const key = `${x},${y}`;
        
        if (visited.has(key)) continue;
        if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) continue;
        if (JSON.stringify(pixels[y][x]) !== targetColor) continue;

        visited.add(key);
        pixels[y][x] = { ...fillColor };

        stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
}

function handleDraw(e) {
    const { x, y } = getPixelCoords(e);
    
    if (currentTool === 'fill') {
        saveState();
        floodFill(x, y);
        render();
        return;
    }
    
    setPixel(x, y);
    render();
}

canvas.addEventListener('mousedown', (e) => {
    if (currentTool === 'fill') {
        handleDraw(e);
        return;
    }
    isDrawing = true;
    saveState();
    handleDraw(e);
});

canvas.addEventListener('mousemove', (e) => {
    if (isDrawing && currentTool !== 'fill') handleDraw(e);
});

canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseleave', () => isDrawing = false);

document.getElementById('colorWhite').addEventListener('click', () => setColor('#ffffff'));
document.getElementById('colorBlack').addEventListener('click', () => setColor('#000000'));

brushSizeSlider.addEventListener('input', (e) => {
    brushSize = parseInt(e.target.value);
    brushSizeLabel.textContent = brushSize;
});

showGridCheckbox.addEventListener('change', render);

document.getElementById('clearBtn').addEventListener('click', () => {
    saveState();
    initPixels();
    render();
});

document.getElementById('undoBtn').addEventListener('click', undo);

function updateToolButtons() {
    document.getElementById('pencilBtn').classList.toggle('tool-active', currentTool === 'pencil');
    document.getElementById('eraserBtn').classList.toggle('tool-active', currentTool === 'eraser');
    document.getElementById('fillBtn').classList.toggle('tool-active', currentTool === 'fill');
}

function setTool(tool) {
    currentTool = tool;
    updateToolButtons();
}

document.getElementById('pencilBtn').addEventListener('click', () => setTool('pencil'));
document.getElementById('eraserBtn').addEventListener('click', () => setTool('eraser'));
document.getElementById('fillBtn').addEventListener('click', () => setTool('fill'));

document.getElementById('generateBtn').addEventListener('click', generateCppArray);
document.getElementById('copyBtn').addEventListener('click', () => {
    cppOutput.select();
    document.execCommand('copy');
    document.getElementById('copyBtn').textContent = '✓ Copied!';
    setTimeout(() => {
        document.getElementById('copyBtn').textContent = '📋 Copy to Clipboard';
    }, 2000);
});

function generateCppArray() {
    const iconName = document.getElementById('iconName').value || 'icon';
    const bytesPerRow = Math.ceil(gridSize / 8);
    const totalBytes = gridSize * bytesPerRow;
    
    let output = `static const unsigned char PROGMEM ${iconName}_${gridSize}[] = {\n`;

    const rows = [];
    for (let y = 0; y < gridSize; y++) {
        const rowBytes = [];
        for (let byteIndex = 0; byteIndex < bytesPerRow; byteIndex++) {
            let byte = 0;
            for (let bit = 0; bit < 8; bit++) {
                const x = byteIndex * 8 + bit;
                if (x < gridSize) {
                    const pixel = pixels[y][x];
                    if (pixel.a > 0) {
                        byte |= (1 << (7 - bit));
                    }
                }
            }
            const invert = document.getElementById('invertColors').checked;
            const finalByte = invert ? (~byte & 0xFF) : byte;
            const binaryStr = finalByte.toString(2).padStart(8, '0');
            rowBytes.push(`0b${binaryStr}`);
        }
        rows.push('  ' + rowBytes.join(', '));
    }

    output += rows.join(',\n');
    output += '\n};';

    cppOutput.value = output;
}

document.getElementById('applyGridSize').addEventListener('click', applyGridSize);
gridSizeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') applyGridSize();
});

// Info panel toggle
document.getElementById('infoToggle').addEventListener('click', () => {
    const content = document.getElementById('infoContent');
    const icon = document.querySelector('.toggle-icon');
    
    content.classList.toggle('collapsed');
    icon.classList.toggle('collapsed');
});

// Initialize
updateCanvasSize();
initPixels();
render();
setColor('#ffffff');
