var clone = require('clone');


function reduceMatrix(matrix, index) {
    var sumMinRows = 0
    var sumMinColumns = 0

    //MINROW
    matrix.forEach((array, index) => {
        var min = Math.min.apply(null, array);
        if (isNaN(min) || !isFinite(min)) {
            min = 0;
        }
        sumMinRows += min
        var minimizedRow = array.map(number => { return number -= min })
        matrix[index] = minimizedRow

    });

    //TRANSPOSED
    matrix = matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));

    //MINCOL
    matrix.forEach((array, index) => {
        var min = Math.min.apply(null, array);
        if (isNaN(min) || !isFinite(min)) {
            min = 0;
        }
        sumMinColumns += min
        var minimizedColumn = array.map(number => { return number -= min })
        matrix[index] = minimizedColumn

    });

    //DISTRAMPOSE
    matrix = matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));

    var total = sumMinRows + sumMinColumns

    var node = {
        index: index,
        matrix: matrix,
        cost: total
    }
    return node
}

function setRowColumnInfinity(matrix, from, to) {
    const thisMatrix = clone(matrix);
    for (let i = 0; i < matrix.length; i++) {
        thisMatrix[from][i] = Infinity
        thisMatrix[i][to] = Infinity
        thisMatrix[to][from] = Infinity
        thisMatrix[to][0] = Infinity
    }
    return thisMatrix
}
function tspBranchAndBound(matrixData) {

    for (let i = 0; i < matrixData.length; i++) {
        for (let j = 0; j < matrixData.length; j++) {
            if (i == j) {
                matrixData[i][j] = Infinity
            }
        }
    }

    const minCostArray = []
    const objRoot = reduceMatrix(matrixData, 0);
    minCostArray.push({
        index: objRoot.index,
        cost: objRoot.cost
    })

    var row = objRoot.index;
    var prevMatrix = clone(objRoot.matrix);
    var prevCost = objRoot.cost

    for (let index = 0; index < matrixData.length - 1; index++) {
        var objArrayTemp = []
        for (let column = 1; column < matrixData.length; column++) {
            const infRowColumn = setRowColumnInfinity(prevMatrix, row, column)
            const objNode = reduceMatrix(infRowColumn, column);

            objNode.cost = objNode.cost + prevCost + prevMatrix[row][column];
            objArrayTemp.push(objNode)
            //.log('Node: %d - Cost: %d', objNode.index, objNode.cost)
        }

        var objMinCost = objArrayTemp.reduce(function (prev, curr) {
            return prev.cost < curr.cost ? prev : curr;
        });
        //console.log('---------MIN--------> Node: %d - Cost: %d ', objMinCost.index, objMinCost.cost)
        minCostArray.push({
            index: objMinCost.index,
            cost: objMinCost.cost
        })
        row = objMinCost.index
        prevMatrix = clone(objMinCost.matrix)
        prevCost = objMinCost.cost
    }

    return minCostArray

}

module.exports = {
    tspBranchAndBound: tspBranchAndBound
}
