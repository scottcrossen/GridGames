const DIRECTION_SLIDE = {
  UP: 'UP',
  RIGHT: 'RIGHT',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
}

const GAMESTATE_SLIDE = {
  PLAYING: 'PLAYING',
  FINISHED: 'FINSIHED',
}

class GameSlide {
  constructor(renderFunction, finish){
    this.board = [
      [1,2,3,4],
      [5,6,7,8],
      [9,10,11,12],
      [13,14,15,0]
    ]
    this.position = {x: 3, y: 3}
    for(var i = 0; i < 250; i++) {
      this.move(Object.values(DIRECTION_SLIDE)[this.getNextRandom(0, 3)])
    }
    this.score = 0
    this.state = GAMESTATE_SLIDE.PLAYING
    this.finish = (finish)? finish : (callback) => callback()
    this.render = () => renderFunction(this.board, this.score, this.state)
    this.render()
  }
  move(direction) {
    var swapPosition
    switch (direction) {
      case DIRECTION_SLIDE.UP:
        swapPosition = {x: this.position.x - 1, y: this.position.y}
        break
      case DIRECTION_SLIDE.RIGHT:
        swapPosition = {x: this.position.x, y: this.position.y + 1}
        break
      case DIRECTION_SLIDE.DOWN:
        swapPosition = {x: this.position.x + 1, y: this.position.y}
        break
      case DIRECTION_SLIDE.LEFT:
        swapPosition = {x: this.position.x, y: this.position.y - 1}
        break
    }
    if (this.board[swapPosition.x] && this.board[swapPosition.x][swapPosition.y]) {
      this.board[this.position.x][this.position.y] = this.board[swapPosition.x][swapPosition.y]
      this.board[swapPosition.x][swapPosition.y] = 0
      this.position = swapPosition
      this.score++
    }
  }

  getNextRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  onKeyPress(direction) {
    if (this.state == GAMESTATE_SLIDE.PLAYING) {
      this.move(direction)
      const boardString = this.board.map((subArray) => subArray.join(',')).join(',')
      if (boardString == '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,0') {
        this.finish(() => {
          this.state = GAMESTATE_SLIDE.FINISHED
        })
      }
      this.render()
    }
  }

  keyHandler() {
    return (e) => {
      e = e || window.event
      switch(e.keyCode) {
        case 38:
          this.onKeyPress(DIRECTION_SLIDE.UP)
          e.preventDefault()
          break
        case 40:
          this.onKeyPress(DIRECTION_SLIDE.DOWN)
          e.preventDefault()
          break
        case 37:
          this.onKeyPress(DIRECTION_SLIDE.LEFT)
          e.preventDefault()
          break
        case 39:
          this.onKeyPress(DIRECTION_SLIDE.RIGHT)
          e.preventDefault()
          break
      }
    }
  }
}

$(document).ready(function() {
  var g = new GameSlide((board, score, gameState) => {
    for (var row = 0; row < 4; row++) {
      for (var col = 0; col < 4; col++) {
        $(`#board-slide #cell-${row}-${col}`).text(() => `${board[row][col] || ''}`)
      }
    }
  }, (callback) => {
    callback()
  })
  $(document).keydown(g.keyHandler())
})
