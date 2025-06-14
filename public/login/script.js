const logBtn = document.getElementById('login');
const form = document.getElementById('form-container');

function userLogin () {
    form.innerHTML = "";
    form.innerHTML += '<form action="/login/auth" method="post"><label for="address" class="form-label">Email ID</label><input required type="email" name="email" class="form-control" id="address" aria-describedby="emailHelp"><div class="mb-3"><label for="exampleInputPassword1" class="form-label">Password</label><input required name="password" type="password" class="form-control" id="exampleInputPassword1"></div>                                  <button type="submit" class="btn btn-primary">Submit</button></form>';
}

function userSignup () {
    form.innerHTML = "";
    form.innerHTML += '<form class="needs-validation" action="/login/signup" method="post">   <div class="mb-3"><label for="firstname" class="form-label">First Name</label><input required type="text" name="firstName" class="form-control" id="firstname" aria-describedby="emailHelp"></div>    <div class="mb-3"><label for="lastname" class="form-label">Last Name</label><input required type="text" name="lastName" class="form-control" id="lastname" aria-describedby="emailHelp"></div>         <div class="mb-3"><label for="contact" class="form-label">Contact Info</label><input required type="number" name="phone" class="form-control" id="contact" placeholder="Phone number (+91)" aria-describedby="emailHelp"></div>          <div class="mb-3">        <input required type="email" name="email" class="form-control" placeholder="Email address" aria-describedby="emailHelp"></div>           <div class="mb-3"><label for="exampleInputPassword1" class="form-label">Password</label><input required name="password" type="password" minlength="8" class="form-control" id="exampleInputPassword1"></div>         <div class="mb-3 form-check"><input required  type="checkbox" class="form-check-input" id="exampleCheck1"><label class="form-check-label" for="exampleCheck1">Accept Terms & Conditions</label></div><button type="submit" class="btn btn-primary">Submit</button></form>';
}