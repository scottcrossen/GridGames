const DIRECTION_2048 = {
  UP: 'UP',
  RIGHT: 'RIGHT',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
}

const GAMESTATE_2048 = {
  PLAYING: 'PLAYING',
  FINISHED: 'FINSIHED',
}

class Game2048 {
  constructor(renderFunction, finish){
    this.board = [
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0],
      [0,0,0,0]
    ]
    const firstPosition = this.getNextRandom(0, 15)
    var secondPosition
    do {
      secondPosition = this.getNextRandom(0, 15)
    } while (firstPosition == secondPosition)
    this.flatIndexBoard(firstPosition, 2)
    this.flatIndexBoard(secondPosition, 2)
    this.score = 0
    this.state = GAMESTATE_2048.PLAYING
    this.finish = (finish)? finish : (callback) => callback()
    this.render = () => renderFunction(this.board, this.score, this.state)
    this.render()
  }

  condense(direction) {
    const getPosition = (x, y, direction, handler) => {
      switch (direction) {
        case DIRECTION_2048.UP:
          return {x: y, y: x}
        case DIRECTION_2048.RIGHT:
          return {x: x, y: 3-y}
        case DIRECTION_2048.DOWN:
          return {x: 3-y, y: x}
        case DIRECTION_2048.LEFT:
          return {x: x, y: y}
      }
    }
    for(var i = 0; i < 4; i++) { // Every row/column depending on direction
      var bigPointer = -1; // Position to condense to
      for (var littlePointer = 0; littlePointer < 4; littlePointer++) { // Position to condense
        const posToCondense = getPosition(i, littlePointer, direction)
        const valToCondense = this.board[posToCondense.x][posToCondense.y]
        if (valToCondense != 0) {
          const lastPosCondensed = getPosition(i, bigPointer, direction)
          if (
            bigPointer < 0 ||
            this.board[posToCondense.x][posToCondense.y] != this.board[lastPosCondensed.x][lastPosCondensed.y]
          ) { // First square or squares can't merge
            const postToCondenseTo = getPosition(i, ++bigPointer, direction)
            this.board[posToCondense.x][posToCondense.y] = 0
            this.board[postToCondenseTo.x][postToCondenseTo.y] = valToCondense
          } else {
            this.board[posToCondense.x][posToCondense.y] = 0
            this.board[lastPosCondensed.x][lastPosCondensed.y] += valToCondense
            this.score += this.board[lastPosCondensed.x][lastPosCondensed.y]
          }
        }
      }
    }
  }

  getNextRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  flatIndexBoard(index, set) {
    if (set != undefined && set != null) {
      this.board[Math.floor(index / 4)][index % 4] = set
    }
    return this.board[Math.floor(index / 4)][index % 4]
  }

  onKeyPress(direction) {
    const compareBoardItems = (compareTo, i, j) => this.board[i] && this.board[i][j] && compareTo == this.board[i][j]
    if (this.state == GAMESTATE_2048.PLAYING) {
      const boardBeforeCondense = this.board.map((subArray) => subArray.join(',')).join(',')
      this.condense(direction)
      const boardAfterCondense = this.board.map((subArray) => subArray.join(',')).join(',')
      var numZeros = 0
      var gameFinished = true
      for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
          const pos = this.board[i][j]
          if (pos == 0) {
            numZeros++
            gameFinished = false
          } else if (
            compareBoardItems(pos, i-1, j) ||
            compareBoardItems(pos, i+1, j) ||
            compareBoardItems(pos, i, j-1) ||
            compareBoardItems(pos, i, j+1)
          ) {
            gameFinished = false
          }
        }
      }
      if (gameFinished) {
        this.finish(() => {
          this.state = GAMESTATE_2048.FINISHED
        })
      } else if (boardBeforeCondense != boardAfterCondense && numZeros) {
        const randomPos = this.getNextRandom(0, numZeros)
        var walkToZero = 0
        for (var i = 0; i < 15; i++) {
          if (this.flatIndexBoard(i) == 0 && walkToZero++ == randomPos) {
            this.flatIndexBoard(i, 2)
          }
        }
      }
      this.render()
    }
  }

  keyHandler() {
    return (e) => {
      e = e || window.event
      switch(e.keyCode) {
        case 38:
          this.onKeyPress(DIRECTION_2048.UP)
          e.preventDefault()
          break
        case 40:
          this.onKeyPress(DIRECTION_2048.DOWN)
          e.preventDefault()
          break
        case 37:
          this.onKeyPress(DIRECTION_2048.LEFT)
          e.preventDefault()
          break
        case 39:
          this.onKeyPress(DIRECTION_2048.RIGHT)
          e.preventDefault()
          break
      }
    }
  }
}

$(document).ready(function() {
  var g = new Game2048((board, score, gameState) => {
    $('#score').text(() => `${score}`)
    for (var row = 0; row < 4; row++) {
      for (var col = 0; col < 4; col++) {
        $(`#board-2048 #cell-${row}-${col}`).text(() => `${board[row][col] || ''}`)
      }
    }
  }, (callback) => {
    callback()
  })
  $(document).keydown(g.keyHandler())
})
