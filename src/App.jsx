import React, { useState, useEffect, useCallback } from 'react'

import './styles.css'

// Sudoku Generator and Solver Logic
const generateSudoku = (difficulty) => {
  const board = Array(9).fill().map(() => Array(9).fill(0))
  
  // Fill diagonal boxes first (independent)
  for (let i = 0; i < 9; i += 3) {
    fillBox(board, i, i)
  }
  
  // Solve the rest
  solveSudoku(board)
  
  // Remove digits based on difficulty
  const attempts = {
    easy: 30,
    medium: 45,
    hard: 55
  }
  
  const puzzle = board.map(row => [...row])
  let cellsToRemove = attempts[difficulty]
  
  while (cellsToRemove > 0) {
    const row = Math.floor(Math.random() * 9)
    const col = Math.floor(Math.random() * 9)
    
    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0
      cellsToRemove--
    }
  }
  
  return {
    initial: puzzle.map(row => [...row]),
    solution: board,
    puzzle: puzzle
  }
}

const fillBox = (board, row, col) => {
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  shuffleArray(nums)
  
  let idx = 0
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      board[row + i][col + j] = nums[idx++]
    }
  }
}

const shuffleArray = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
}

const solveSudoku = (board) => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValidMove(board, row, col, num)) {
            board[row][col] = num
            if (solveSudoku(board)) {
              return true
            }
            board[row][col] = 0
          }
        }
        return false
      }
    }
  }
  return true
}

const isValidMove = (board, row, col, num) => {
  // Check row
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num) return false
  }
  
  // Check column
  for (let i = 0; i < 9; i++) {
    if (board[i][col] === num) return false
  }
  
  // Check 3x3 box
  const startRow = Math.floor(row / 3) * 3
  const startCol = Math.floor(col / 3) * 3
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[startRow + i][startCol + j] === num) return false
    }
  }
  
  return true
}

const isBoardFull = (board) => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) return false
    }
  }
  return true
}

const checkBoard = (board, solution) => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] !== 0 && board[row][col] !== solution[row][col]) {
        return false
      }
    }
  }
  return true
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
    highscores: []
  })
  
  const [showWinAnimation, setShowWinAnimation] = useState(false)
  
  // Load highscores from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sudokuHighscores')
    if (saved) {
      setGameState(prev => ({ ...prev, highscores: JSON.parse(saved) }))
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
  
  const startGame = (difficulty) => {
    const { initial, solution, puzzle } = generateSudoku(difficulty)
    
    setGameState({
      initialBoard: initial,
      currentBoard: puzzle,
      solution: solution,
      selectedCell: null,
      errors: [],
      difficulty: difficulty,
      startTime: Date.now(),
      elapsedTime: 0,
      gameStatus: 'playing',
      highscores: gameState.highscores
    })
    
    setShowWinAnimation(false)
  }
  
  const handleCellClick = (row, col) => {
    if (gameState.gameStatus !== 'playing') return
    setGameState(prev => ({
      ...prev,
      selectedCell: { row, col }
    }))
  }
  
  const handleNumberInput = (num) => {
    if (gameState.gameStatus !== 'playing' || !gameState.selectedCell) return
    
    const { row, col } = gameState.selectedCell
    const { initialBoard, currentBoard } = gameState
    
    // Can't modify pre-filled cells
    if (initialBoard[row][col] !== 0) return
    
    const newBoard = [...currentBoard]
    newBoard[row] = [...currentBoard[row]]
    newBoard[row][col] = num
    
    setGameState(prev => ({
      ...prev,
      currentBoard: newBoard
    }))
  }
  
  const handleDelete = () => {
    if (gameState.gameStatus !== 'playing' || !gameState.selectedCell) return
    
    const { row, col } = gameState.selectedCell
    const { initialBoard, currentBoard } = gameState
    
    if (initialBoard[row][col] !== 0) return
    
    const newBoard = [...currentBoard]
    newBoard[row] = [...currentBoard[row]]
    newBoard[row][col] = 0
    
    setGameState(prev => ({
      ...prev,
      currentBoard: newBoard
    }))
  }
  
  const checkWin = useCallback(() => {
    if (gameState.gameStatus !== 'playing') return
    
    const { currentBoard, solution, difficulty, elapsedTime, highscores } = gameState
    
    if (isBoardFull(currentBoard) && checkBoard(currentBoard, solution)) {
      // Win!
      const newHighscore = {
        difficulty,
        time: elapsedTime,
        date: new Date().toISOString()
      }
      
      const scores = [...highscores[difficulty] || [], newHighscore]
        .sort((a, b) => a.time - b.time)
        .slice(0, 5)
      
      const updatedHighscores = {
        ...highscores,
        [difficulty]: scores
      }
      
      localStorage.setItem('sudokuHighscores', JSON.stringify(updatedHighscores))
      
      setGameState(prev => ({
        ...prev,
        highscores: updatedHighscores,
        gameStatus: 'won'
      }))
      
      setShowWinAnimation(true)
    }
  }, [gameState])
  
  // Check win periodically
  useEffect(() => {
    if (gameState.gameStatus === 'playing') {
      checkWin()
    }
  }, [gameState.currentBoard, checkWin])
  
  const getCellClass = (row, col) => {
    const { initialBoard, currentBoard, selectedCell } = gameState
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
    
    return className
  }
  
  const getRank = (difficulty, time) => {
    const scores = gameState.highscores[difficulty] || []
    if (scores.length === 0) return '-'
    
    const sorted = [...scores].sort((a, b) => a.time - b.time)
    const rank = sorted.findIndex(s => s.time >= time) + 1
    return rank <= scores.length ? `${rank}/${scores.length}` : '-'
  }
  
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
          
      <footer className="app-footer">
        <span>Sudoku PWA v{import.meta.env.VERSION}</span>
      </footer>
</div>
          
          {Object.keys(gameState.highscores).length > 0 && (
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
                          
      <footer className="app-footer">
        <span>Sudoku PWA v{import.meta.env.VERSION}</span>
      </footer>
</div>
                        ))
                      )}
                    
      <footer className="app-footer">
        <span>Sudoku PWA v{import.meta.env.VERSION}</span>
      </footer>
</div>
                  
      <footer className="app-footer">
        <span>Sudoku PWA v{import.meta.env.VERSION}</span>
      </footer>
</div>
                )
              })}
            
      <footer className="app-footer">
        <span>Sudoku PWA v{import.meta.env.VERSION}</span>
      </footer>
</div>
          )}
        
      <footer className="app-footer">
        <span>Sudoku PWA v{import.meta.env.VERSION}</span>
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
          
      <footer className="app-footer">
        <span>Sudoku PWA v{import.meta.env.VERSION}</span>
      </footer>
</div>
          
          <div className="game-info">
            <div className="info-item">
              <span>Difficulty:</span>
              <span style={{ color: getDifficultyColor(gameState.difficulty) }}>
                {gameState.difficulty.charAt(0).toUpperCase() + gameState.difficulty.slice(1)}
              </span>
            
      <footer className="app-footer">
        <span>Sudoku PWA v{import.meta.env.VERSION}</span>
      </footer>
</div>
            <div className="info-item">
              <span>Time:</span>
              <span>{formatTime(gameState.elapsedTime)}</span>
            
      <footer className="app-footer">
        <span>Sudoku PWA v{import.meta.env.VERSION}</span>
      </footer>
</div>
          
      <footer className="app-footer">
        <span>Sudoku PWA v{import.meta.env.VERSION}</span>
      </footer>
</div>
          
          <div className="sudoku-grid">
            {gameState.currentBoard?.map((row, rowIndex) => (
              <div key={rowIndex} className="grid-row">
                {row.map((cell, colIndex) => (
                  <div
                    key={colIndex}
                    className={getCellClass(rowIndex, colIndex)}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {cell !== 0 ? cell : ''}
                  
      <footer className="app-footer">
        <span>Sudoku PWA v{import.meta.env.VERSION}</span>
      </footer>
</div>
                ))}
              
      <footer className="app-footer">
        <span>Sudoku PWA v{import.meta.env.VERSION}</span>
      </footer>
</div>
            ))}
          
      <footer className="app-footer">
        <span>Sudoku PWA v{import.meta.env.VERSION}</span>
      </footer>
</div>
          
          <div className="numpad">
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
          
      <footer className="app-footer">
        <span>Sudoku PWA v{import.meta.env.VERSION}</span>
      </footer>
</div>
        
      <footer className="app-footer">
        <span>Sudoku PWA v{import.meta.env.VERSION}</span>
      </footer>
</div>
      )}
      
      {gameState.gameStatus === 'won' && (
        <div className={`win-screen ${showWinAnimation ? 'animate' : ''}`}>
          <div className="win-content">
            <h2 className="win-title">🎉 You Won!</h2>
            <p className="win-message">Great job solving the {gameState.difficulty} puzzle!</p>
            
            <div className="win-stats">
              <div className="stat-item">
                <span>Difficulty:</span>
                <span style={{ color: getDifficultyColor(gameState.difficulty) }}>
                  {gameState.difficulty.charAt(0).toUpperCase() + gameState.difficulty.slice(1)}
                </span>
              
      <footer className="app-footer">
        <span>Sudoku PWA v{import.meta.env.VERSION}</span>
      </footer>
</div>
              <div className="stat-item">
                <span>Time:</span>
                <span>{formatTime(gameState.elapsedTime)}</span>
              
      <footer className="app-footer">
        <span>Sudoku PWA v{import.meta.env.VERSION}</span>
      </footer>
</div>
              {gameState.highscores[gameState.difficulty] && (
                <div className="stat-item">
                  <span>Your Rank:</span>
                  <span>{getRank(gameState.difficulty, gameState.elapsedTime)}</span>
                
      <footer className="app-footer">
        <span>Sudoku PWA v{import.meta.env.VERSION}</span>
      </footer>
</div>
              )}
            
      <footer className="app-footer">
        <span>Sudoku PWA v{import.meta.env.VERSION}</span>
      </footer>
</div>
            
            <div className="win-buttons">
              <button 
                className="btn play-again-btn"
                onClick={() => startGame(gameState.difficulty)}
              >
                Play Again
              </button>
              <button 
                className="btn menu-btn"
                onClick={() => setGameState(prev => ({
                  ...prev,
                  gameStatus: 'menu',
                  selectedCell: null
                }))}
              >
                Main Menu
              </button>
            
      <footer className="app-footer">
        <span>Sudoku PWA v{import.meta.env.VERSION}</span>
      </footer>
</div>
          
      <footer className="app-footer">
        <span>Sudoku PWA v{import.meta.env.VERSION}</span>
      </footer>
</div>
        
      <footer className="app-footer">
        <span>Sudoku PWA v{import.meta.env.VERSION}</span>
      </footer>
</div>
      )}
    
      <footer className="app-footer">
        <span>Sudoku PWA v{import.meta.env.VERSION}</span>
      </footer>
</div>
  )
}