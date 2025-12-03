// 游戏状态
let currentPlayer = 'black';
let gameOver = false;
let boardState = Array(15).fill().map(() => Array(15).fill(null));
let moveHistory = [];

// 初始化游戏
function initGame() {
    const board = document.getElementById('board');
    board.innerHTML = '';

    // 创建15×15棋盘
    for (let row = 0; row < 15; row++) {
        for (let col = 0; col < 15; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;

            // 鼠标悬停事件
            cell.addEventListener('mouseenter', function () {
                if (gameOver || boardState[row][col]) return;

                // 移除其他单元格的预览
                document.querySelectorAll('.preview').forEach(preview => preview.remove());

                const preview = document.createElement('div');
                preview.className = `stone preview ${currentPlayer}`;
                cell.appendChild(preview);
            });

            // 鼠标离开事件
            cell.addEventListener('mouseleave', function () {
                // 这里不处理，让预览在点击或其他单元格悬停时被移除
            });

            // 点击事件
            cell.addEventListener('click', function () {
                if (gameOver || boardState[row][col]) return;

                // 移除所有预览
                document.querySelectorAll('.preview').forEach(preview => preview.remove());

                placeStone(row, col);
            });

            board.appendChild(cell);
        }
    }

    resetGame();
}

// 重置游戏
function resetGame() {
    currentPlayer = 'black';
    gameOver = false;
    boardState = Array(15).fill().map(() => Array(15).fill(null));
    moveHistory = [];

    // 清空棋盘上的棋子
    document.querySelectorAll('.stone:not(.preview)').forEach(stone => stone.remove());

    // 更新状态显示
    updateStatus('黑子先行');
    document.getElementById('player').textContent = '当前: 黑子';

    // 隐藏获胜动画
    document.getElementById('win-animation').classList.add('hidden');

    // 发送重置请求到后端
    sendResetToBackend();
}

// 放置棋子
function placeStone(row, col) {
    // 创建棋子
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    const stone = document.createElement('div');
    stone.className = `stone ${currentPlayer}`;
    cell.appendChild(stone);

    // 更新棋盘状态
    boardState[row][col] = currentPlayer;

    // 记录移动
    moveHistory.push({ row, col, player: currentPlayer });

    // 前端判断胜负
    if (checkWin(row, col)) {
        gameOver = true;
        showWinner(currentPlayer);
    } else {
        // 切换玩家
        currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
        document.getElementById('player').textContent = `当前: ${currentPlayer === 'black' ? '黑子' : '白子'}`;
    }

    // 发送坐标数据到后端
    sendMoveToBackend(row, col);
}

// 检查是否获胜
function checkWin(row, col) {
    const player = boardState[row][col];
    const directions = [
        [0, 1],   // 水平
        [1, 0],   // 垂直
        [1, 1],   // 对角线（右下）
        [1, -1]   // 对角线（左下）
    ];

    for (const [dx, dy] of directions) {
        let count = 1;

        // 正向检查
        for (let i = 1; i < 5; i++) {
            const newRow = row + dx * i;
            const newCol = col + dy * i;

            if (newRow < 0 || newRow >= 15 ||
                newCol < 0 || newCol >= 15 ||
                boardState[newRow][newCol] !== player) {
                break;
            }
            count++;
        }

        // 反向检查
        for (let i = 1; i < 5; i++) {
            const newRow = row - dx * i;
            const newCol = col - dy * i;

            if (newRow < 0 || newRow >= 15 ||
                newCol < 0 || newCol >= 15 ||
                boardState[newRow][newCol] !== player) {
                break;
            }
            count++;
        }

        if (count >= 5) {
            return true;
        }
    }

    return false;
}

// 发送落子数据到后端
async function sendMoveToBackend(row, col) {
    const moveData = {
        row: row,
        col: col,
        player: boardState[row][col],
        timestamp: new Date().toISOString(),
        boardState: boardState
    };

    try {
        const response = await fetch('http://localhost:3000/api/move', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(moveData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('后端响应:', result);
        }
    } catch (error) {
        console.error('连接后端失败:', error);
    }
}

// 发送重置请求到后端
async function sendResetToBackend() {
    try {
        await fetch('http://localhost:3000/api/reset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.log('重置请求发送失败:', error);
    }
}

// 悔棋
function undoLastMove() {
    if (moveHistory.length === 0 || gameOver) return;

    const lastMove = moveHistory.pop();
    const { row, col, player } = lastMove;

    // 从棋盘状态中移除
    boardState[row][col] = null;

    // 从DOM中移除棋子
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    const stone = cell.querySelector('.stone:not(.preview)');
    if (stone) stone.remove();

    // 恢复当前玩家
    currentPlayer = player;
    document.getElementById('player').textContent = `当前: ${currentPlayer === 'black' ? '黑子' : '白子'}`;
}

// 显示获胜者
function showWinner(winner) {
    gameOver = true;

    const winText = document.getElementById('win-text');
    winText.textContent = `${winner === 'black' ? '黑子' : '白子'} 获胜!`;

    const winAnimation = document.getElementById('win-animation');
    winAnimation.classList.remove('hidden');

    // 5秒后自动隐藏获胜动画
    setTimeout(() => {
        winAnimation.classList.add('hidden');
    }, 5000);
}

// 更新状态显示
function updateStatus(text) {
    document.getElementById('status').textContent = text;
    // 移除所有预览棋子
    document.querySelectorAll('.preview').forEach(preview => preview.remove());
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function () {
    initGame();

    // 重新开始按钮
    document.getElementById('restart').addEventListener('click', resetGame);

    // 悔棋按钮
    document.getElementById('undo').addEventListener('click', undoLastMove);

    // 点击获胜动画区域可以提前关闭
    document.getElementById('win-animation').addEventListener('click', function () {
        this.classList.add('hidden');
    });
});