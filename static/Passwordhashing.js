const btn = document.getElementById('LogInForm');
btn.addEventListener('submit', handleSubmit);

async function hashPassword(password){
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return toHex(hashBuffer);
}

async function toHex(buffer){
    const byteArr = new Uint8Array(buffer);
    const hexCodes = [...byteArr].map(byte => {
        const hexCode = byte.toString(16).padStart(2, '0');
        return hexCode;
    });
    return hexCodes.join('');
}

function clearInput(){
    document.getElementById('e-mail').value = '';
    document.getElementById('e-password').value = '';
}

async function handleSubmit(event){
    event.preventDefault();
    const username = document.getElementById('e-mail').value;
    const password = document.getElementById('password').value;
    const hashedPassword =  await hashPassword(password);
    const response = await fetch("/LogIn",{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body:
            JSON.stringify({ username:username, password: hashedPassword })
    });
        
    if (response.ok) {
        const result = await response.json();
        if (result.success) {
            window.location.href = result.redirect_url;
        } else {
            const failure = document.getElementById('wrong-credentials');
            failure.innerText = "Invalid Credentials";
            clearInput();
            console.log("Login failed: Invalid credentials");
        }
    } else {
        const failure = document.getElementById('wrong-credentials');
        failure.innerText = "Login request failed";
        clearInput();
        console.log("Login request failed");
    }
}
