const App = require("./../app.js");



describe("Data tests", () => {

    /* CONSTRUCTION */

    let app;
    const type = "image/webp";

    beforeAll(() => {
        const canvas = document.createElement("canvas");

        canvas.id       = "canvas";
        canvas.width    = 200;
        canvas.height   = 200;

        document.body.appendChild(canvas);

        app = new App();
    });


    /* LOGIC */

    it("should initialize the board datas", () => {
        const boardData = app.boardData;

        // Check the correct number of lines
        expect(boardData.length).toBe(3);

        boardData.forEach(data => {
            // Check the correct number of columns
            expect(data.length).toBe(3)

            // Check the correct value of cells
            data.forEach(cell => expect(cell).toBe(0));
        });
    });

    it("should return the cell info 0", () => {
        const cell = app.getCellInfo(0, 0);

        expect(cell).toBe(0);
    });

    it("should return undefined if the cell doesnot exist", () => {
        const cell = app.getCellInfo(-1, 78);

        expect(cell).toBeUndefined();
    });

    it("should update the correct cell with the value of 1", () => {
        app.updateBoardData(1, 1, true);
        expect(app.getCellInfo(1, 1)).toBe(1);
    });

    it("should update the correct cell with the value of -1", () => {
        app.updateBoardData(0, 0);
        expect(app.getCellInfo(0, 0)).toBe(-1);
    });

    it("should not update the board if the cell is not empty", () => {
        app.updateBoardData(0, 0, true);
        expect(app.getCellInfo(0, 0)).toBe(-1);
    });

    it("should not have a winner", () => {
        expect(app.checkBoardData()).toBeFalsy();
    });

    it("should update the cell value with a click", () => {
        app.isCross = false;
        app.onClick({
            pageX: app.canvas.offsetLeft + app.cellWidth,
            pageY: app.canvas.offsetTop + (app.cellHeight / 2)
        });

        expect(app.getCellInfo(1, 0)).toBe(-1);
    });

    it("shouldnot update the cell value with a click if the cell is not empty", () => {
        app.isCross = true;
        app.onClick({
            pageX: app.canvas.offsetLeft + app.cellWidth,
            pageY: app.canvas.offsetTop + (app.cellHeight / 2)
        });

        expect(app.getCellInfo(1, 0)).toBe(-1);
    });

    it("should have a winner with a line of circles", () => {
        app.updateBoardData(2, 0);
        expect(app.checkBoardData()).toBeTruthy();
    });

    it("should restart the board datas", () => {
        app.onClick({
            pageX: 0,
            pageY: 0
        });

        expect(app.getCellInfo(1, 0)).toBe(0);
        expect(app.checkBoardData()).toBeFalsy();
    });

    it("should tell you that the board is not full", () => {
        expect(app.isBoardFull()).toBeFalsy();
    });

    it("should have a winner with a column of crosses", () => {
        app.updateBoardData(0, 0, true);
        app.updateBoardData(0, 1, true);
        app.updateBoardData(0, 2, true);
        expect(app.checkBoardData()).toBeTruthy();
    });

    it("should have a winner with a line of circles", () => {
        app.start();
        app.updateBoardData(0, 1);
        app.updateBoardData(1, 1);
        app.updateBoardData(2, 1);
        expect(app.checkBoardData()).toBeTruthy();
    });

    it("should have a winner with a diagonal of circle", () => {
        app.start();
        app.updateBoardData(2, 0, true);
        app.updateBoardData(1, 1, true);
        app.updateBoardData(0, 2, true);
        expect(app.checkBoardData()).toBeTruthy();
    });


    /* SNAPSHOTS */

    it("should render the board", () => {
        app.start();

        expect(app.canvas.toDataURL(type)).toMatchSnapshot();
    });

    it("should render crosses on cells selected", () => {
        app.start();
        app.fillCell(1 * app.cellWidth, 0 * app.cellHeight, true);
        app.fillCell(0 * app.cellWidth, 1 * app.cellHeight, true);
        app.fillCell(2 * app.cellWidth, 1 * app.cellHeight, true);
        app.fillCell(1 * app.cellWidth, 2 * app.cellHeight, true);
        expect(app.canvas.toDataURL(type)).toMatchSnapshot();
    });

    it("should fill the empty cells with circles", () => {
        app.fillCell(0 * app.cellWidth, 0 * app.cellHeight);
        app.fillCell(2 * app.cellWidth, 0 * app.cellHeight);
        app.fillCell(1 * app.cellWidth, 1 * app.cellHeight);
        app.fillCell(0 * app.cellWidth, 2 * app.cellHeight);
        app.fillCell(2 * app.cellWidth, 2 * app.cellHeight);
        expect(app.canvas.toDataURL(type)).toMatchSnapshot();
    });

    it("should tell you that the board is full", () => {
        expect(app.isBoardFull()).toBeTruthy();
    });
});