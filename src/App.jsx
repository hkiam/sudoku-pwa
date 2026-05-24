import { useState, useEffect, useCallback } from 'react';
import { VERSION } from './version.js';

// Sudoku Generator Functions
function generateSudoku(difficulty) {
  const board = Array.from({ length: 9 }, () => Array(9).fill(0));
  
  // Fill diagonal 3x3 boxes first (independent)
  for (let i = 0; i < 9; i += 3) {
    fillBox(board, i, i);
  }
  
  // Solve the rest
  solveSudoku(board);
  
  const solution = board.map(row => [...row]);
  
  // Remove digits based on difficulty
  let cellsToRemove;
  switch (difficulty) {
    case 'easy': cellsToRemove = 30; break;
    case 'medium': cellsToRemove = 45; break;
    case 'hard': cellsToRemove = 58; break;
    default: cellsToRemove = 30;
  }
  
  const puzzle = board.map(row => [...row]);
  let removed = 0;
  while (removed < cellsToRemove) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0;
      removed++;
    }
  }
  
  return { initial: puzzle, solution, puzzle };
}

function fillBox(board, rowStart, colStart) {
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  // Shuffle numbers
  for (let i = nums.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }
  
  let idx = 0;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      board[rowStart + i][colStart + j] = nums[idx++];
    }
  }
}

function solveSudoku(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) {
              return true;
            }
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function isValid(board, row, col, num) {
  // Check row
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num) return false;
  }
  
  // Check column
  for (let i = 0; i < 9; i++) {
    if (board[i][col] === num) return false;
  }
  
  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[boxRow + i][boxCol + j] === num) return false;
    }
  }
  
  return true;
}

function isBoardFull(board) {
  return board.every(row => row.every(cell => cell !== 0));
}

function checkBoard(currentBoard, solution) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (currentBoard[row][col] !== solution[row][col]) {
        return false;
      }
    }
  }
  return true;
}

// Main App Component
export default function App() {
  const [gameState, setGameState] = useState({
    initialBoard: null,
    currentBoard: null,
    solution: null,
    selectedCell: null,
    errors: [],
    difficulty: 'easy',
    startTime: null,
    elapsedTime: 0,
    gameStatus: 'menu', // menu, playing, won
    highscores: { easy: [], medium: [], hard: [] },
    notes: {} // Map of "row,col" -> [numbers]
  })
  
  const [showWinAnimation, setShowWinAnimation] = useState(false)
  const [pencilMode, setPencilMode] = useState(false)
  
  // Load highscores from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sudokuHighscores')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setGameState(prev => ({ ...prev, highscores: parsed }))
      } catch (e) {
        console.error('Failed to parse highscores:', e)
      }
    }
  }, [])
  
  // Timer
  useEffect(() => {
    let interval
    if (gameState.gameStatus === 'playing' && gameState.startTime) {
      interval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          elapsedTime: Math.floor((Date.now() - prev.startTime) / 1000)
        }))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [gameState.gameStatus, gameState.startTime])
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  const startGame = useCallback((difficulty) => {
    const { initial, solution, puzzle } = generateSudoku(difficulty)
    
    setGameState(prev => ({
      initialBoard: initial,
      currentBoard: puzzle,
      solution: solution,
      selectedCell: null,
      errors: [],
      difficulty: difficulty,
      startTime: Date.now(),
      elapsedTime: 0,
      gameStatus: 'playing',
      highscores: prev.highscores,
      notes: {}
    }))
    
    setPencilMode(false)
    setShowWinAnimation(false)
  }, [])
  
  const handleCellClick = (row, col) => {
    if (gameState.gameStatus !== 'playing') return
    setGameState(prev => ({
      ...prev,
      selectedCell: { row, col }
    }))
  }
  
  const checkWin = useCallback(() => {
    if (gameState.gameStatus !== 'playing') return
    
    const { currentBoard, solution } = gameState
    
    if (isBoardFull(currentBoard) && checkBoard(currentBoard, solution)) {
      // Win!
      const newHighscore = {
        difficulty: gameState.difficulty,
        time: gameState.elapsedTime,
        date: new Date().toISOString()
      }
      
      const scores = [...(gameState.highscores[gameState.difficulty] || []), newHighscore]
        .sort((a, b) => a.time - b.time)
        .slice(0, 5)
      
      const updatedHighscores = {
        ...gameState.highscores,
        [gameState.difficulty]: scores
      }
      
      localStorage.setItem('sudokuHighscores', JSON.stringify(updatedHighscores))
      
      setGameState(prev => ({
        ...prev,
        highscores: updatedHighscores,
        gameStatus: 'won'
      }))
      
      setShowWinAnimation(true)
    }
  }, [gameState.difficulty, gameState.elapsedTime, gameState.gameStatus, gameState.highscores])
  
  const handleNumberInput = useCallback((num) => {
    // Validate number input (1-9 only)
    if (typeof num !== 'number' || num < 1 || num > 9) {
      console.warn('Invalid number input:', num)
      return
    }
    
    if (gameState.gameStatus !== 'playing' || !gameState.selectedCell) return
    
    const { row, col } = gameState.selectedCell
    const { initialBoard, currentBoard } = gameState
    
    // Can't modify pre-filled cells
    if (initialBoard[row][col] !== 0) return
    
    if (pencilMode) {
      // Add/remove note
      const key = `${row},${col}`
      const currentNotes = gameState.notes[key] || []
      let newNotes
      if (currentNotes.includes(num)) {
        newNotes = currentNotes.filter(n => n !== num)
      } else {
        newNotes = [...currentNotes, num].sort((a, b) => a - b)
      }
      
      setGameState(prev => ({
        ...prev,
        notes: { ...prev.notes, [key]: newNotes }
      }))
    } else {
      // Normal mode: set number
      const newBoard = currentBoard.map(r => [...r])
      newBoard[row][col] = num
      
      setGameState(prev => ({
        ...prev,
        currentBoard: newBoard
      }))
      
      // Check win only after valid input
      checkWin()
    }
  }, [gameState.gameStatus, gameState.selectedCell, gameState.initialBoard, checkWin, pencilMode, gameState.notes])
  
  const handleDelete = useCallback(() => {
    if (gameState.gameStatus !== 'playing' || !gameState.selectedCell) return
    
    const { row, col } = gameState.selectedCell
    const { initialBoard, currentBoard } = gameState
    
    if (initialBoard[row][col] !== 0) return
    
    const newBoard = currentBoard.map(r => [...r])
    newBoard[row][col] = 0
    
    const key = `${row},${col}`
    const newNotes = { ...gameState.notes }
    delete newNotes[key]
    
    setGameState(prev => ({
      ...prev,
      currentBoard: newBoard,
      notes: newNotes
    }))
    
    // Check win after delete
    checkWin()
  }, [gameState.gameStatus, gameState.selectedCell, gameState.initialBoard, checkWin, gameState.notes])
  
  const getCellClass = (row, col) => {
    const { initialBoard, currentBoard, selectedCell, notes } = gameState
    const isSelected = selectedCell?.row === row && selectedCell?.col === col
    
    // Determine if cell has an error
    let isError = false
    if (currentBoard[row][col] !== 0 && initialBoard[row][col] === 0) {
      if (currentBoard[row][col] !== gameState.solution[row][col]) {
        isError = true
      }
    }
    
    // Determine if cell is part of initial board
    const isPreFilled = initialBoard[row][col] !== 0
    
    // Determine box borders
    const isBorderTop = row % 3 === 0 && row !== 0
    const isBorderBottom = row % 3 === 2
    const isBorderLeft = col % 3 === 0 && col !== 0
    const isBorderRight = col % 3 === 2
    
    let className = 'cell'
    if (isSelected) className += ' selected'
    if (isPreFilled) className += ' pre-filled'
    if (isError) className += ' error'
    if (isBorderTop) className += ' border-top'
    if (isBorderBottom) className += ' border-bottom'
    if (isBorderLeft) className += ' border-left'
    if (isBorderRight) className += ' border-right'
    
    // Highlight cells with same number as selected cell
    if (selectedCell && currentBoard[row][col] !== 0) {
      const selectedNumber = currentBoard[selectedCell.row][selectedCell.col]
      if (currentBoard[row][col] === selectedNumber) {
        className += ' highlighted'
      }
    }
    
    // Check if cell has notes
    const key = `${row},${col}`
    if (notes[key] && notes[key].length > 0) {
      className += ' has-notes'
    }
    
    return className
  }
  
  const getRank = useCallback((difficulty, time) => {
    const scores = gameState.highscores[difficulty] || []
    if (scores.length === 0) return '-'
    
    // Sort by time ascending (lower is better)
    const sorted = [...scores].sort((a, b) => a.time - b.time)
    
    // Find rank: how many scores are strictly better than current time
    const betterCount = sorted.filter(s => s.time < time).length
    
    // Rank is 1-based: if 2 scores are better, you're rank 3
    const rank = betterCount + 1
    
    // Only show rank if you're in top scores
    if (rank <= sorted.length) {
      return `${rank}/${sorted.length}`
    }
    return '-'
  }, [gameState.highscores])
  
  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'easy': return '#4ecca3'
      case 'medium': return '#ffd700'
      case 'hard': return '#e94560'
      default: return '#fff'
    }
  }

  return (
    <div className="app">
      {gameState.gameStatus === 'menu' && (
        <div className="menu-screen">
          <h1 className="title">Sudoku</h1>
          <p className="subtitle">Classic Number Puzzle</p>
          
          <div className="difficulty-selector">
            <h3>Select Difficulty</h3>
            <button 
              className="btn difficulty-btn"
              style={{ borderLeft: `4px solid #4ecca3` }}
              onClick={() => startGame('easy')}
            >
              Easy
            </button>
            <button 
              className="btn difficulty-btn"
              style={{ borderLeft: `4px solid #ffd700` }}
              onClick={() => startGame('medium')}
            >
              Medium
            </button>
            <button 
              className="btn difficulty-btn"
              style={{ borderLeft: `4px solid #e94560` }}
              onClick={() => startGame('hard')}
            >
              Hard
            </button>
          </div>

          {(gameState.highscores.easy.length > 0 || gameState.highscores.medium.length > 0 || gameState.highscores.hard.length > 0) && (
            <div className="highscores-section">
              <h3>Top Scores</h3>
              {['easy', 'medium', 'hard'].map(diff => {
                const scores = gameState.highscores[diff] || []
                return (
                  <div key={diff} className="highscore-level">
                    <span style={{ color: getDifficultyColor(diff) }}>
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </span>
                    <div className="highscore-list">
                      {scores.length === 0 ? (
                        <span>No scores yet</span>
                      ) : (
                        scores.map((score, idx) => (
                          <div key={idx} className="highscore-item">
                            <span>{idx + 1}.</span>
                            <span>{formatTime(score.time)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <footer className="app-footer">
            <span>Sudoku PWA v{VERSION}</span>
          </footer>
        </div>
      )}
      
      {gameState.gameStatus === 'playing' && (
        <div className="game-screen">
          <div className="game-header">
            <h2>Sudoku</h2>
            <button 
              className="btn back-btn"
              onClick={() => setGameState(prev => ({
                ...prev,
                gameStatus: 'menu',
                selectedCell: null
              }))}
            >
              ← Menu
            </button>
          </div>
          
          <div className="game-info">
            <div className="info-item">
              <span>Difficulty:</span>
              <span style={{ color: getDifficultyColor(gameState.difficulty) }}>
                {gameState.difficulty.charAt(0).toUpperCase() + gameState.difficulty.slice(1)}
              </span>
            </div>
            <div className="info-item">
              <span>Time:</span>
              <span>{formatTime(gameState.elapsedTime)}</span>
            </div>
          </div>
          
          <div className="sudoku-grid">
            {gameState.currentBoard?.map((row, rowIndex) => (
              <div key={rowIndex} className="grid-row">
                {row.map((cell, colIndex) => {
                  const key = `${rowIndex},${colIndex}`
                  const notes = gameState.notes[key] || []
                  
                  return (
                    <div
                      key={colIndex}
                      className={getCellClass(rowIndex, colIndex)}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                    >
                      {cell !== 0 ? cell : (
                        notes.length > 0 && (
                          <div className="notes-grid">
                            {notes.map(num => (
                              <span key={num} className="note-num">{num}</span>
                            ))}
                          </div>
                        )
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
          
          <div className="numpad">
            <button
              className={`btn pencil-btn ${pencilMode ? 'active' : ''}`}
              onClick={() => setPencilMode(!pencilMode)}
            >
              Pencil
            </button>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <button
                key={num}
                className="btn numpad-btn"
                onClick={() => handleNumberInput(num)}
              >
                {num}
              </button>
            ))}
            <button
              className="btn delete-btn"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>

          <footer className="app-footer">
            <span>Sudoku PWA v{VERSION}</span>
          </footer>
        </div>
      )}

      {gameState.gameStatus === 'won' && (
        <div className="win-screen">
          <h2>🎉 You Won!</h2>
          <p>Time: {formatTime(gameState.elapsedTime)}</p>
          <button 
            className="btn"
            onClick={() => setGameState(prev => ({
              ...prev,
              gameStatus: 'menu'
            }))}
          >
            Back to Menu
          </button>

          <footer className="app-footer">
            <span>Sudoku PWA v{VERSION}</span>
          </footer>
        </div>
      )}
    </div>
  )
}