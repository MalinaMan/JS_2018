(function () {
  "use strict";

  var users;
  var button = document.getElementById("load");
  button.addEventListener('click', loadUsers);


  function loadUsers() {
    var xhr = new XMLHttpRequest();
    const URL_USERS_API = 'https://api.randomuser.me/1.0/?results=50&nat=gb,us&inc=gender,name,location,email,phone,picture';

    xhr.open('GET', URL_USERS_API, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.send();

    xhr.onreadystatechange = function() {
      if (this.readyState != 4) return;

      if (xhr.status != 200) {
        alert("Error getting data = " + xhr.status + ': ' + xhr.statusText);
      } else {
        let data = JSON.parse(xhr.responseText);
        if ('results' in data) {
          button.innerHTML = 'load';
          button.disabled = false;
          processData(data.results);
        }
        else {
          alert("Format error: no properties name 'results'");
        }
      }
    }

    button.innerHTML = 'loading...';
    button.disabled = true;
  }

  function getPostsTemplate(users) {
    return users.reduce((tmpl, user) => {
      tmpl += `<div class="tr" data-index=${users.indexOf(user)}>
          <div class="td users-avatar"><img src=${user.picture.medium}></div>
          <div class="td users-name">${user.name.title}. ${user.name.first} ${user.name.last}</div>
        </div>`;
      return tmpl;
    }, '');
  }

  function processData(users)
  {
    let oldChild = document.querySelector('.table');
    let item = document.createElement("div");
    let newElem;

    item.className = 'table';
    item.innerHTML = `<div class="tr">
      <div class="th users-avatar">Avatar</div>
      <div class="th users-name">Users name</div>
      </div>` +
    getPostsTemplate(users);
    let mainNode = document.querySelector('.main');
    if (oldChild) {
      newElem = mainNode.replaceChild(item, oldChild);
    } else {
      newElem = mainNode.appendChild(item);
    }
    newElem.addEventListener('click', showDetailInfo, false);
  }

  function showDetailInfo(event)
  {
    //let { parentNode } = event.target;
    if (event.target.className === 'tr'){
      alert(parentNode.dataset.index);
    }
  }

}());