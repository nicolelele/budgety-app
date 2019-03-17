//BUDGET CONTROLLER
var budgetController = (function() {
   
    var Expense = function(id, description, value) {
        this.id = id,
        this.description = description,
        this.value = value,
        this.percentage = -1
    };

    Expense.prototype.calcPercent = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round(this.value / totalIncome * 100);
        } else {
            this.percentage = -1;
        }
    }
    Expense.prototype.getPercent = function() {
        return this.percentage;
    }

    var Income = function(id, description, value) {
        this.id = id,
        this.description = description,
        this.value = value
    };

    var calculateTotal = function(type) {
        var sum = 0;

        data.allItems[type].forEach(function(current) {
            sum += + current.value;
        });
        data.totals[type] = sum;
    }

    var data = {
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function(type, desc, val) {
            var newItem, ID;

            //Create new ID
            if (data.allItems[type] > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            //Create new item based on 'exp' or 'inc' type
            if (type === 'exp') {
                newItem = new Expense(ID, desc, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, desc, val);
            }

            //Push into data structure
            data.allItems[type].push(newItem);

            //Return new element
            return newItem;
        },

        deleteItem: function(type, id) {
            var ids, index;
            
            ids = data.allItems[type].map(function(current) {  //like foreach
                return current.id;
            });

            index = ids.indexOf(id); 
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function() {

            //Calculate total income & expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //Calculate budget
            data.budget = data.totals.inc - data.totals.exp;

            //Calc percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round(data.totals.exp / data. totals.inc * 100);
            } else {
                data.percentage = -1;
            }
        },
        
        calculatePercentage: function() {
            data.allItems.exp.forEach(function(current) {
                current.calcPercent(data.totals.inc);
            });
        },

        getPercentage: function() {
            var allPerc = data.allItems.exp.map(function(current) {
                return current.getPercent();
            });
            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function() {
            // console.log(budget);
        }
    }
})();

//UI CONTROLLER
var UIController = (function() {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container-lists',
        expensePercentage: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num,type) {
        var numSplit, int, dec, type;
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length-3) + ',' + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];

        // type === 'exp' ? sign = '-' : sign = '+';
        // return type + ' ' + int + dec;
        return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + int + '.' + dec;
    };
    
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        };
    };

    return {
        getInput: function() {
                // var type = document.querySelector('.add__type').value;
                // // either inc or exp
                // var description = document.querySelector('.add__document').value;
                // var
            return {
                type: document.querySelector(DOMstrings.inputType).value,   // either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function(obj, type) {
            var html, newHtml, element;

            //Create html string with a placeholder
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type ==='exp') {
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percentage%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //Replace placeholder with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            // newHtml = newHtml.replace('%value%', obj.value);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //Insert html into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deteteListItem: function(selectorId) {
            var el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },

        clearFields: function() {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue); //returns a list = convert to array

            fieldsArr = Array.prototype.slice.call(fields); //tricks slice method into thinking we give array, but thats a list
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
            fieldsArr[0].focus();
        },

        displayBudget: function(obj) {
            obj.budget > 0 ? type = 'inc' : type = 'exp'
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentage: function(percentage) {
            var fields = document.querySelectorAll(DOMstrings.expensePercentage);

            nodeListForEach(fields, function(current, index) {
                if (percentage[index] > 0) {
                    current.textContent = percentage[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function() {
            var now, month, months, year;
            now = new Date();
            // var christmas = new Date(2016,11,25);
            months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changeType: function() {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);

            nodeListForEach(fields, function(current) {
                current.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: function() {
            return DOMstrings;
        }
    };
})();


//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event) { 
            if (event.keycode === 13 || event.which ===13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    };

    var updateBudget = function() {
        //4. Calculate budget
        budgetCtrl.calculateBudget();

        //5. Return budget
        var budget = budgetCtrl.getBudget();

        //6. Display budget in UI
        UICtrl.displayBudget(budget);

    }

    var updatePercentage = function() {

        //1. Calculate percentage
        budgetCtrl.calculatePercentage();

        //2. Read percentage from the budget
        var percentages = budgetCtrl.getPercentage();

        //3. Update UI with new percentage
        UICtrl.displayPercentage(percentages);
    }

    var ctrlAddItem = function() {
        var input, newItem;

        //1. Get filled input data
        var input = UICtrl.getInput();
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {   //2. Add item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. Add item to UI
            UICtrl.addListItem(newItem, input.type);

            //4. Clear fields
            UICtrl.clearFields();

            //5. Calculate and update budget
            updateBudget();

            //6. Calculate and update percentage
            updatePercentage();
        }
    };

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        itemID = (event.target.parentNode.parentNode.parentNode.parentNode.id);
        //dom traversing
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. Delete item from data structure
            budgetCtrl.deleteItem(type, ID);

            //2. Delete item from user interface
            UICtrl.deteteListItem(itemID);

            //3. Update and show the new budget
            updateBudget();

            //4. Calculate and update percentage
            updatePercentage();
        }
    }

    return {
        init: function() {
            // console.log('app started');
            UICtrl.displayMonth();
            setupEventListeners();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
        }
    };

})(budgetController, UIController);

controller.init();
