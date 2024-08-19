const board = document.querySelector('.board');
const ranks = Array.from(document.querySelectorAll('.rank'));
const squares = Array.from(document.querySelectorAll('.rank .white-square, .rank .black-square'));
let turn = 'white';
let dotsVisible = false;
let whiteKingPosition = { row: 7, col: 4 }; 
let blackKingPosition = { row: 0, col: 4 }; 

const isKingInCheck = (kingPosition, isWhite) => {
    const opponentColor = isWhite ? 'black' : 'white';
    const opponentPieces = Array.from(document.querySelectorAll(`.piece img[src*="${opponentColor}"]`));
    
    return opponentPieces.some(piece => {
        const pieceParent = piece.closest('.piece').parentElement;
        const piecePos = getPosition(pieceParent);
        return validMove(pieceParent, piecePos, kingPosition);
    });
};


const getAllPossibleMoves = (isWhite) => {
    const allPossibleMoves = [];
    squares.forEach(square => {
        const piece = square.querySelector('.piece img');
        if (piece && piece.src.includes(isWhite ? 'white' : 'black')) {
            const piecePos = getPosition(piece.parentElement);
            getAllValidMoves(piece.parentElement, piecePos).forEach(move => {
                allPossibleMoves.push({ piece: piece.parentElement, from: piecePos, to: move });
            });
        }
    });
    return allPossibleMoves;
};

const canBlockCheck = (kingPosition, isWhite) => {
    const allPossibleMoves = getAllPossibleMoves(isWhite);
    return allPossibleMoves.some(({ piece, from, to }) => {
        const targetSquare = ranks[to.row].children[to.col];
        const originalPiece = targetSquare.querySelector('.piece img');
        if (originalPiece) {
            targetSquare.removeChild(originalPiece.parentElement);
        }

        const originalParent = piece.parentElement;
        originalParent.removeChild(piece);
        targetSquare.appendChild(piece);

        const isCheckAfterMove = isKingInCheck(kingPosition, isWhite);

        targetSquare.removeChild(piece);
        originalParent.appendChild(piece);
        if (originalPiece) {
            targetSquare.appendChild(originalPiece.parentElement);
        }

        return !isCheckAfterMove;
    });
};


function logPiecePosition(piece, rankIndex, squareIndex) {
    const pieceType = piece.querySelector('img').src.split('/').pop();
}



const isCheckmate = (kingPosition, isWhite) => {
    if (!isKingInCheck(kingPosition, isWhite)) {
        return false;
    }

    const king = isWhite ? 'white-king' : 'black-king';
    const kingPiece = document.querySelector(`img[src*="${king}"]`).closest('.piece');
    const kingMoves = getAllValidMoves(kingPiece, kingPosition);

    if (kingMoves.some(move => !isKingInCheck(move, isWhite))) {
        return false;
    }

    if (canBlockCheck(kingPosition, isWhite)) {
        return false;
    }
    return true;
};


const simulateMoveAndCheck = (piece, from, to, kingPosition, isWhite) => {
    const targetSquare = ranks[to.row].children[to.col];
    const originalPiece = targetSquare.querySelector('.piece img');
    if (originalPiece) {
        targetSquare.removeChild(originalPiece.parentElement);
    }

    const originalParent = piece.parentElement;
    originalParent.removeChild(piece);
    targetSquare.appendChild(piece);

    const isCheckAfterMove = isKingInCheck(kingPosition, isWhite);

    targetSquare.removeChild(piece);
    originalParent.appendChild(piece);
    if (originalPiece) {
        targetSquare.appendChild(originalPiece.parentElement);
    }

    return isCheckAfterMove;
};



const pieceImages = {
    white: {
        rook: 'white-rook.png',
        knight: 'white-knight.png',
        bishop: 'white-bishop.png',
        queen: 'white-queen.png',
        king: 'white-king.png',
        pawn: 'white-pawn.png'
    },
    black: {
        rook: 'black-rook.png',
        knight: 'black-knight.png',
        bishop: 'black-bishop.png',
        queen: 'black-queen.png',
        king: 'black-king.png',
        pawn: 'black-pawn.png'
    }
};

let selectedPiece = null;
let moveFrom = null;

const getPosition = (element) => {
    const rankElement = element.closest('.rank');
    const rankIndex = Array.from(rankElement.parentElement.children).indexOf(rankElement);
    const squareIndex = Array.from(rankElement.children).indexOf(element);
    return { row: rankIndex, col: squareIndex };
};

const validMove = (piece, from, to) => {
    const pieceSrc = piece.querySelector('img').src.split('/').pop().split('.')[0];
    const isWhite = pieceSrc.includes('white');
    const targetSquare = ranks[to.row].children[to.col];

    if (isOccupiedBySameColor(targetSquare, isWhite)) {
        return false;
    }

    if (pieceSrc === 'white-king' || pieceSrc === 'black-king') {
        return validKingMove(from, to) || isCastlingMove(piece, from, to);
    }

    switch (pieceSrc) {
        case 'white-rook':
        case 'black-rook':
            return validRookMove(from, to) && isPathClear(from, to);
        case 'white-knight':
        case 'black-knight':
            return validKnightMove(from, to);
        case 'white-bishop':
        case 'black-bishop':
            return validBishopMove(from, to) && isPathClear(from, to);
        case 'white-queen':
        case 'black-queen':
            return validQueenMove(from, to) && isPathClear(from, to);
        case 'white-pawn':
        case 'black-pawn':
            return validPawnMove(from, to, isWhite);
        default:
            return false;
    }
};




const validRookMove = (from, to) => {
    return from.row === to.row || from.col === to.col;
};

const validKnightMove = (from, to) => {
    const rowDiff = Math.abs(from.row - to.row);
    const colDiff = Math.abs(from.col - to.col);
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
};

const validBishopMove = (from, to) => {
    return Math.abs(from.row - to.row) === Math.abs(from.col - to.col);
};

const validQueenMove = (from, to) => {
    return validRookMove(from, to) || validBishopMove(from, to);
};

const validKingMove = (from, to) => {
    const rowDiff = Math.abs(from.row - to.row);
    const colDiff = Math.abs(from.col - to.col);
    return (rowDiff <= 1 && colDiff <= 1);
};

const validPawnMove = (from, to, isWhite) => {
    const direction = isWhite ? -1 : 1;
    const rowDiff = to.row - from.row;
    const colDiff = Math.abs(to.col - from.col);

    if (colDiff === 0 && rowDiff === direction && !isOccupied(ranks[to.row].children[to.col])) {
        return true;
    }

    if (colDiff === 0 && rowDiff === 2 * direction && from.row === (isWhite ? 6 : 1)) {
        const intermediateSquare = ranks[from.row + direction].children[from.col];
        if (!isOccupied(intermediateSquare) && !isOccupied(ranks[to.row].children[to.col])) {
            return true;
        }
    }

    if (colDiff === 1 && rowDiff === direction && isOccupiedByOpponent(ranks[to.row].children[to.col], isWhite)) {
        return true;
    }
    
    return false;
};

function isCastlingMove(piece, from, to) {
    const pieceSrc = piece.querySelector('img').src.split('/').pop().split('.')[0];
    if (!pieceSrc.includes('king')) return false;

    const rowDiff = Math.abs(from.row - to.row);
    const colDiff = Math.abs(from.col - to.col);
    return rowDiff === 0 && colDiff === 2 && isPathClearForCastling(piece, from, to);
}

function isPathClearForCastling(piece, from, to) {
    const kingRow = from.row;
    const direction = to.col > from.col ? 1 : -1;
    const rookCol = to.col > from.col ? 7 : 0;

    for (let col = from.col + direction; col !== rookCol; col += direction) {
        if (ranks[kingRow].children[col].querySelector('.piece')) {
            return false;
        }
    }

    for (let col = from.col; col !== to.col + direction; col += direction) {
        if (isSquareUnderAttack({ row: kingRow, col }, piece.querySelector('img').src.includes('white'))) {
            return false;
        }
    }

    return true;
}

function isSquareUnderAttack(square, isWhite) {
    const opponentColor = isWhite ? 'black' : 'white';
    const directions = [
        { row: 1, col: 0 }, { row: -1, col: 0 }, { row: 0, col: 1 }, { row: 0, col: -1 },
        { row: 1, col: 1 }, { row: 1, col: -1 }, { row: -1, col: 1 }, { row: -1, col: -1 }
    ];
    const knightMoves = [
        { row: 2, col: 1 }, { row: 2, col: -1 }, { row: -2, col: 1 }, { row: -2, col: -1 },
        { row: 1, col: 2 }, { row: 1, col: -2 }, { row: -1, col: 2 }, { row: -1, col: -2 }
    ];
    const pawnMoves = isWhite ? [{ row: -1, col: -1 }, { row: -1, col: 1 }] : [{ row: 1, col: -1 }, { row: 1, col: 1 }];

    for (const direction of directions) {
        let row = square.row + direction.row;
        let col = square.col + direction.col;
        while (withinBoard(row, col)) {
            const piece = ranks[row].children[col].querySelector('.piece img');
            if (piece) {
                const pieceType = piece.src.split('/').pop().split('.')[0];
                if (pieceType.includes(opponentColor)) {
                    if (pieceType.includes('queen') ||
                        (pieceType.includes('rook') && Math.abs(direction.row) !== Math.abs(direction.col)) ||
                        (pieceType.includes('bishop') && Math.abs(direction.row) === Math.abs(direction.col))) {
                        return true;
                    }
                    break;
                } else {
                    break;
                }
            }
            row += direction.row;
            col += direction.col;
        }
    }

    for (const move of knightMoves) {
        const row = square.row + move.row;
        const col = square.col + move.col;
        if (withinBoard(row, col)) {
            const piece = ranks[row].children[col].querySelector('.piece img');
            if (piece && piece.src.includes(opponentColor) && piece.src.includes('knight')) {
                return true;
            }
        }
    }

    for (const move of pawnMoves) {
        const row = square.row + move.row;
        const col = square.col + move.col;
        if (withinBoard(row, col)) {
            const piece = ranks[row].children[col].querySelector('.piece img');
            if (piece && piece.src.includes(opponentColor) && piece.src.includes('pawn')) {
                return true;
            }
        }
    }

    const kingMoves = directions.concat([{ row: 1, col: 1 }, { row: 1, col: -1 }, { row: -1, col: 1 }, { row: -1, col: -1 }]);
    for (const move of kingMoves) {
        const row = square.row + move.row;
        const col = square.col + move.col;
        if (withinBoard(row, col)) {
            const piece = ranks[row].children[col].querySelector('.piece img');
            if (piece && piece.src.includes(opponentColor) && piece.src.includes('king')) {
                return true;
            }
        }
    }

    return false;
}

function withinBoard(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}

const isOccupiedByOpponent = (targetSquare, isWhite) => {
    const piece = targetSquare.querySelector('.piece img');
    if (!piece) return false;

    const pieceSrc = piece.src.split('/').pop().split('.')[0]; 
    return (pieceSrc.includes('white') && !isWhite) || (pieceSrc.includes('black') && isWhite);
};

document.querySelectorAll('.piece').forEach(piece => {
    piece.addEventListener('click', showLegalMoves);
});

function showLegalMoves(event) {
    const piece = event.target.closest('.piece');
    const position = getPosition(piece.parentElement);
    
    if (selectedPiece === piece) {
        if (dotsVisible) {
            clearDots();
        }
        dotsVisible = !dotsVisible;
    } else {
        clearDots();
        const legalMoves = getAllValidMoves(piece, position);
        legalMoves.forEach(move => {
            const dot = document.createElement('div');
            dot.className = 'dot';
            dot.dataset.row = move.row;
            dot.dataset.col = move.col;
            const targetSquare = ranks[move.row].children[move.col];
            targetSquare.appendChild(dot);

            dot.addEventListener('click', (dotEvent) => {
                handleMove(dotEvent, piece, move);
                clearDots();
            });
        });
        dotsVisible = true;
    }

    selectedPiece = piece;
}


function getAllValidMoves(piece, from) {
    const legalMoves = [];

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const to = { row, col };
            if (validMove(piece, from, to)) {
                legalMoves.push(to);
            }
        }
    }

    return legalMoves;
}



function clearDots() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach(dot => dot.remove());
}

function handleMove(event, piece, moveTo) {
    event.preventDefault();
    const targetSquare = ranks[moveTo.row].children[moveTo.col];
    if (!targetSquare) return;

    const moveFrom = getPosition(piece.parentElement);
    if (validMove(piece, moveFrom, moveTo)) {
        const targetPiece = targetSquare.querySelector('.piece img');
        if (targetPiece) targetPiece.parentElement.remove();

        if (isCastlingMove(piece, moveFrom, moveTo)) {
            handleCastling(piece, moveFrom, moveTo);
        } else {
            targetSquare.appendChild(piece);
        }

        if (piece.querySelector('img').src.includes('king')) {
            if (piece.querySelector('img').src.includes('white')) {
                whiteKingPosition = moveTo;
            } else {
                blackKingPosition = moveTo;
            }
        }

        turn = turn === 'white' ? 'black' : 'white';
    }
    const isWhite = piece.src.includes('white');
    const opponentKing = document.querySelector(`img[src*="${isWhite ? 'black-king' : 'white-king'}"]`);
    const opponentKingPosition = getPosition(opponentKing.closest('.piece').parentElement);

    if (isKingInCheck(opponentKingPosition, !isWhite)) {
        if (isCheckmate(opponentKingPosition, !isWhite)) {
            alert('Checkmate! Game over.');
            endGame();
        } else {
            alert('Check!');
        }
    }
}

const endGame = () => {
    alert("The game has ended. You can reset the board or start a new game.");
};

const handleDragStart = (event) => {
    const piece = event.target.closest('.piece');
    const pieceSrc = piece.querySelector('img').src.split('/').pop().split('.')[0];
    const isWhite = pieceSrc.includes('white');

    if ((turn === 'white' && isWhite) || (turn === 'black' && !isWhite)) {
        selectedPiece = piece;
        moveFrom = getPosition(selectedPiece.parentElement);
        event.dataTransfer.setData('text/plain', '');
        clearDots();
    } else {
        event.preventDefault();
        alert("Wrong color!")
    }
};

function isOccupiedBySameColor(square, isWhite) {
    const piece = square.querySelector('.piece');
    if (!piece) return false;

    const imgElement = piece.querySelector('img');
    if (!imgElement) return false;

    const pieceSrc = imgElement.src.split('/').pop();
    const pieceIsWhite = pieceSrc.includes('white');
    return pieceIsWhite === isWhite;
}

const allowDrop = (event) => {
    event.preventDefault();
    const targetSquare = event.target.closest('.white-square, .black-square');
    if (!targetSquare || !selectedPiece) return;

    const moveTo = getPosition(targetSquare);
    handleMove(event, selectedPiece, moveTo);
    clearDots();
};

function isPathClear(from, to) {
    if (from.row === to.row) { 
        const step = from.col < to.col ? 1 : -1;
        for (let col = from.col + step; col !== to.col; col += step) {
            if (isOccupied(ranks[from.row].children[col])) {
                return false;
            }
        }
    } else if (from.col === to.col) {
        const step = from.row < to.row ? 1 : -1;
        for (let row = from.row + step; row !== to.row; row += step) {
            if (isOccupied(ranks[row].children[from.col])) {
                return false;
            }
        }
    } else {
        const rowStep = from.row < to.row ? 1 : -1;
        const colStep = from.col < to.col ? 1 : -1;
        let row = from.row + rowStep;
        let col = from.col + colStep;
        while (row !== to.row && col !== to.col) {
            if (isOccupied(ranks[row].children[col])) {
                return false;
            }
            row += rowStep;
            col += colStep;
        }
    }
    return true;
}

function isOccupied(square) {
    return square.querySelector('.piece') !== null;
}

const allowDragging = (event) => {
    event.preventDefault();
};

const initializeBoard = () => {
    squares.forEach(square => {
        square.addEventListener('dragover', allowDragging);
        square.addEventListener('drop', allowDrop);
    });

    document.querySelectorAll('.piece').forEach(piece => {
        piece.draggable = true;
        piece.addEventListener('dragstart', handleDragStart);
    });

    const whiteKing = document.querySelector('.white-king');
    const blackKing = document.querySelector('.black-king');

    if (whiteKing) {
        whiteKingPosition = getPosition(whiteKing.parentElement);
    }
    if (blackKing) {
        blackKingPosition = getPosition(blackKing.parentElement);
    }
};


initializeBoard();