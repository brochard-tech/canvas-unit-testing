class App {

    /**
     * @constructor
     */
    constructor () {

        /**
         * The canvas DOM
         * @type {HTMLCanvasElement}
         */
        this.canvas = document.getElementById("canvas");

        /**
         * The context of the canvas
         * @type {CanvasRenderingContext2D}
         */
        this.ctx = this.canvas.getContext("2d");

        /**
         * The width of the canvas
         * @type {number}
         */
        this.width = this.canvas.width;

        /**
         * The height of the canvas
         * @type {number}
         */
        this.height = this.canvas.height;

        /**
         * The width of a cell
         * @type {number}
         */
        this.cellWidth = this.width / 3;

        /**
         * The height of a cell
         * @type {number}
         */
        this.cellHeight = this.height / 3;

        /**
         * If true, the next draw will be a cross. If false, it will be a circle
         * @type {boolean}
         */
        this.isCross    = Math.floor(Math.random() * 100) > 50

        this.canvas.addEventListener("click", this.onClick.bind(this), false);
        this.start();
    }

    /**
     * Start or restart the game
     * @return {void}
     */
    start () {
        this.resetBoardData();

        this.ctx.clearRect(0, 0, this.width, this.height);
        this.renderBoard();
    }

    /**
     * Reset the data of the board
     * @returns {void}
     */
    resetBoardData () {
        this.boardData = [];

        for (let line = 0; line < 3; line++) {
            this.boardData[line] = [];

            for (let column = 0; column < 3; column++) {
                this.boardData[line][column] = 0;
            }
        }
    }

    /**
     * Update the cell in the board data
     * @param {number} column - The column corresponding of the cell
     * @param {number} line - The line corresponding of the cell
     * @param {isCross} boolean - If true, it will update the cell by a cross, or a circle if its false
     * @returns {boolean} Return true if the board has been updated
     */
    updateBoardData (column, line, isCross = false) {
        const cell = this.getCellInfo(column, line);

        if (typeof cell === "undefined" || (cell !== 0)) {
            return false;
        }

        this.boardData[line][column] = isCross ? 1 : -1;
        return true;
    }

    /**
     * Check if a board is full or not
     * @return {boolean} True if the board is full
     */
    isBoardFull () {
        return !this.boardData.reduce((acc, val) => acc.concat(val), [])
            .filter(val => val === 0).length;
    }

    /**
     * Check the board data to know if there is a winner or if there is no more empty cells
     * 
     * To find if there is a winner, we check all lines, all columns and all diagonals if the sum of the cells infos is
     * 3 (for cross) or -3 (circle)
     * @returns {boolean} Return true if there is a winner
     */
    checkBoardData () {
        const checkWinner = (value, xStart, yStart, xEnd, yEnd) => {
            const absValue = Math.abs(value) === 3;

            if (absValue) {
                this.renderWinner(xStart, yStart, xEnd, yEnd, value === 3);
            }

            return Boolean(absValue);
        };

        // check columns
        for (let line = 0; line < 3; line++) {
            if (checkWinner(this.boardData[line].reduce((acc, val) => acc + val, 0),
                0, line * this.cellHeight,
                2 * this.cellWidth, line * this.cellHeight)) {

                return true;
            }
        }

        // check lines
        for (let column = 0; column < 3; column++) {
            if (checkWinner(
                [this.getCellInfo(column, 0), this.getCellInfo(column, 1), this.getCellInfo(column, 2)].reduce((acc, val) => acc + val, 0),
                column * this.cellWidth, 0,
                column * this.cellWidth, 2 * this.cellHeight)) {

                return true;
            }
        }

        // check diagonals
        return checkWinner([this.getCellInfo(0, 0), this.getCellInfo(1, 1), this.getCellInfo(2, 2)].reduce((acc, val) => acc + val, 0), 0, 0, 2 * this.cellWidth, 2 * this.cellHeight)
            || checkWinner([this.getCellInfo(2, 0), this.getCellInfo(1, 1), this.getCellInfo(0, 2)].reduce((acc, val) => acc + val, 0), 2 * this.cellWidth, 0, 0, 2 * this.cellHeight);
    }

    /**
     * Know the info about a cell
     * @param {number} column - The column corresponding of the cell
     * @param {number} line - The line corresponding of the cell
     * @returns {number} The info of the cell
     */
    getCellInfo (column, line) {
        return this.boardData[line] && this.boardData[line][column];
    }

    /**
     * Method fire when user click on the canvas
     * @param {MouseEvent} event - The click event
     * @return {void}
     */
    onClick (event) {
        const offsetLeft    = this.canvas.offsetLeft,
            offsetTop       = this.canvas.offsetTop;

        if (this.isBoardFull() || this.checkBoardData()) {
            this.start();
            return null;
        }

        if (this.fillCell(event.pageX - offsetLeft, event.pageY - offsetTop, this.isCross)) {
            this.isCross = !this.isCross;
        }
    }

    /**
     * Get the top-right corner position of the cell relative to the position passed in parameters
     * @param {number} x - Position in x axis
     * @param {number} y - Position in y axis
     * @return {{x: number, y: number}} The top-right corner position of a cell
     */
    getCellByPosition (x, y) {
        const column    = Math.floor(x / this.cellWidth),
            line        = Math.floor(y / this.cellHeight);

        return {
            line: line,
            column: column,
            x: column * this.cellWidth,
            y: line * this.cellHeight
        };
    }

    /**
     * If the cell is empty, it will fill it with a cross or a circle
     * @param {number} x - Position in x axis
     * @param {number} y - Position in y axis
     * @param {isCross} boolean - If true, it will update the cell by a cross, or a circle if its false
     * @returns {void}
     */
    fillCell (x, y, isCross = false) {
        const cellPos = this.getCellByPosition(x, y);

        if (!this.updateBoardData(cellPos.column, cellPos.line, isCross)) {
            return false;
        }

        if (isCross) {
            this.renderCross(cellPos.x, cellPos.y);

        } else {
            this.renderCircle(cellPos.x, cellPos.y);

        }

        this.checkBoardData();
        return true;
    }


    /* RENDER */

    /**
     * Render the board, the delimitation of all cells
     * @return {void}
     */
    renderBoard () {
        this.ctx.strokeStyle    = "black";
        this.ctx.lineWidth      = 1;

        this.ctx.strokeRect(0, 0, this.width, this.height);

        for (let line = 0; line < 3; line++) {
            for (let column = 0; column < 3; column++) {
                const x = line * this.cellWidth,
                    y   = column * this.cellHeight;

                this.ctx.strokeRect(x, y, this.cellWidth, this.cellHeight);
            }
        }
    }

    /**
     * Render a cross in The cell position
     * @param {number} x - The position of the cell in x axis
     * @param {number} y - The position of the cell in y axis
     * @returns {void}
     */
    renderCross (x, y) {
        const offset            = 5;

        this.ctx.strokeStyle    = "blue";
        this.ctx.lineWidth      = 7;

        this.ctx.beginPath();
            this.ctx.moveTo(x + offset, y + offset);
            this.ctx.lineTo(x + this.cellWidth - offset, y + this.cellHeight - offset);
            this.ctx.moveTo(x + this.cellWidth - offset, y + offset);
            this.ctx.lineTo(x + offset, y + this.cellHeight - offset);
            this.ctx.stroke();
        this.ctx.closePath();
    }

    /**
     * Render a circle in the cell position
     * @param {number} x - The position of the cell in x axis
     * @param {number} y - The position of the cell in y axis
     * @returns {void}
     */
    renderCircle (x, y) {
        const radius = (Math.min(this.cellWidth, this.cellHeight) / 2) - 5;

        this.ctx.strokeStyle    = "darkgreen";
        this.ctx.lineWidth      = 7;

        this.ctx.beginPath();
            this.ctx.arc(x + (this.cellWidth / 2), y + (this.cellHeight / 2), radius, 0, 2 * Math.PI);
            this.ctx.stroke();
        this.ctx.closePath();
    }

    /**
     * Render a line that show the winner
     * @param {number} x - The position of the cell in x axis
     * @param {number} y - The position of the cell in y axis
     * @param {boolean} isCross - Know if the winner is a cross or a circle
     * @returns {void}
     */
    renderWinner (xStart, yStart, xEnd, yEnd, isCross) {
        this.ctx.strokeStyle    = isCross ? "darkgreen" : "blue";
        this.ctx.lineStyle      = 12;
        this.ctx.beginPath();
            this.ctx.moveTo(xStart + (this.cellWidth / 2), yStart + (this.cellHeight / 2));
            this.ctx.lineTo(xEnd + (this.cellWidth / 2), yEnd + (this.cellHeight / 2));
            this.ctx.stroke();
        this.ctx.closePath();
    }
}

try {
    module.exports = App;
} catch (e) {
    exports = App;
}