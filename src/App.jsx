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
    highscores: { easy: [], medium: [], hard: [] }
  })
  
  const [showWinAnimation, setShowWinAnimation] = useState(false)
  
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
      
      const scores = [...(highscores[difficulty] || []), newHighscore]
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
                {row.map((cell, colIndex) => (
                  <div
                    key={colIndex}
                    className={getCellClass(rowIndex, colIndex)}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  >
                    {cell !== 0 ? cell : ''}
                  </div>
                ))}
              </div>
            ))}
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