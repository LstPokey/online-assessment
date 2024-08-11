# Dokumentation Eigenleistung (4045911)

Dieses Dokumentent beschreibt die Funktionsweise für die Landing Page für den
Bewerber nach dem Log-in (`/Home`).

Auf der Seite findet der User eine Begrüßung sowie Links für die zu
absolvierenden Tests. Da jeder User unterschiedliche Kombinationen an Tests
zugewiesen bekommen kann, müssen die Links prozedural generiert und angezeigt
werden.


## Backend

Im Backend ist dafür folgender Code verantwortlich (in app.py):
```py
@app.route("/Home")
def Home():
    db = getDB()
    cur = db.execute(
        "SELECT Persönlichkeitstest, Musteraufgabe, Schlüsselaufgabe FROM User WHERE ID = ?",
        (session['user_id'],)
    )
    tests = cur.fetchone()
    tests = dict(tests)
    close_connection()
    print(tests)

    urls = {}
    for k,v in tests.items():
        # we need to check manually because of poor naming :/
        if k == "Persönlichkeitstest":
            urls[k] = url_for("Persoenlichkeit")
        elif k == "Musteraufgabe":
            urls[k] = url_for("Logicver")
        elif k == "Schlüsselaufgabe":
            urls[k] = url_for("Timed_KeySelects")

    return render_template("user_index.html", tests=tests, urls=urls)
```

Es wird eine Verbindung zur DB aufgebaut. Im localStorage ist die ID des Users
gespeichert; diese wird benutzt, um die Spalten "Persönlichkeitstest",
"Musteraufgabe" und "Schlüsselaufgabe" abzufragen. Dies sind Integer (0=false,
1=true). Das Ergebnis wird in ein Dictionary umgewandelt, damit die Namen als
Keys funktionieren und ein Array mit magic numbers verwendet werden muss.
Anschließend wird ein neues Dictionary `urls` erstellt und mit den
entsprechenden Routen befüllt (leider wurde das Naming nicht einheitlich
geregelt, dafür die ifs. Zum Schluss werden die beiden Dictionarys mit dem HTML
Code returnt, damit Jinja im Frontend die richtigen Links anzeigen kann.


## Frontend

Das Frontend befindet sich in der `templates/user_index.html`. Das JavaScript
konnte hier ausnahmsweise nicht in den static/ Ordner verlegt werden, weil Flask
die Variablen für die Jinja Engine an HTML Code senden muss.

Der wesentliche HTML Code sieht folgendermaßen aus:
```html
<ul class="list-disc pl-4">
    {% for k,v in tests.items() %}
    <li id="{{k}}" data-solved="0" {%if not v%}hidden{%endif%}>
        <a href="{{ urls[k] }}" class="underline text-blue-700" onclick="update_solved_tests(event)">
            {{ k }}
        </a>
    </li>
    {% endfor %}
</ul>
```

Es wird eine Unordered List erstellt und für jeden (in der DB vorhandenen) Test
ein Bullet Point erstellt. Damit nur für den User relevante Tests sieht,
werden mit `{%if not v%}hidden{%endif%}` alle Tests, die in der DB für den User
`0` stehen haben, automatisch ausgeblendet. Die Links zu den Test-Seiten werden
durch das Dictionary `urls` eingefügt. Das `data-solved` Attribut dient dazu,
bereits angeklickte Tests nach dem Zurückkehren auf diese Seite auszublenden
(dafür die ID).

```js
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
}
```

Beim Laden der Seite wird zuerst geprüft, ob im localStorage die absolvierten
Tests getrackt werden ("solved_tests"). Falls nicht, wird ein Dictionary
präpariert, das im localStorage gespeichert wird. Falls schon getrackt wird,
werden alle bereits absolvierten Tests gezählt und das `data-solved` Attribut
auf 1 gesetzt. Falls alle Tests absolviert wurden, wird auf die Endseite
weitergeleitet. Falls nicht, werden zum Schluss alle Listen-Einträge, die als
solved markiert sind, versteckt.

Wenn ein Link angeklickt wird, wird im localStorage das Dictionary aktualisiert.

Weil nur Strings gespeichert werden können, muss jedes mal (de-)serialisiert
werden.
