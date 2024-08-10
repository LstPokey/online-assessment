if ($IsMac) {
	pip3 install flask
} else {
	pip install flask
}

npm install -D tailwindcss
npx tailwindcss -i ./input.css -o ./static/output.css --minify

if ($IsMac) {
	python3 app.py
} else {
	python app.py
}
