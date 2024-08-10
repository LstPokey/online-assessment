let solved_tests = {};
$(function () {

    if (localStorage.getItem("solved_tests") === null) {
        let tests = JSON.parse(`{{ tests|tojson }}`);

        // filter out tests that dont need to be solved
        for (let key in tests)
            if (tests.hasOwnProperty(key) && tests[key] !== 1) delete tests[key];

        // initialize array to track solved tests
        for (let key in tests) solved_tests[key] = 0;
        localStorage.setItem("solved_tests", JSON.stringify(solved_tests));
    } else {
        solved_tests = JSON.parse(localStorage.getItem("solved_tests"));
        let numOfElements = Object.entries(solved_tests).length;
        let counter = 0;

        for (let key in solved_tests) {
            if (solved_tests[key] == 1) {
                counter++;
                $("#" + key).data("solved", 1);
            }
        }
        if (counter == numOfElements) location.href = "/ClosingPage";
    }

    $("li").each(function (index, elem) {
        if ($(this).data("solved") == 1) $(this).hide();
    });
});

function update_solved_tests(event) {
    let key = event.target.parentNode.id;
    solved_tests[key] = 1;
    localStorage.setItem("solved_tests", JSON.stringify(solved_tests));

    $("#" + event.target.parentNode.id).data("solved", 1);
}