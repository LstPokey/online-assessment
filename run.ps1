if ($IsMac) {
	brew install python
	pip3 install flask
} elseif ($IsLinux) {
	apt install python
	pip install flask
} else {
	winget install -e --id Python.Python.3.11
	pip install flask
}

npm install -D tailwindcss
npx tailwindcss -i ./input.css -o ./static/output.css --minify

if ($IsMac) {
	python3 app.py
} else {
	python app.py
}
