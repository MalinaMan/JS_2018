(function () {
  "use strict";

  var users;
  
  document.getElementById("load").addEventListener('click', loadUsers);
  document.getElementById('close').addEventListener('click', function() { show('none'); });
  document.getElementById('sortSelect').addEventListener('change', function() { processData(users); });

  function loadUsers() {
    let button = document.getElementById("load");
    let xhr = new XMLHttpRequest();
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
          users = data.results;
          processData(users);
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
      let name = user.name;
      tmpl += `<div class="tr" data-index=${users.indexOf(user)}>
          <div class="td users-avatar"><img src=${user.picture.medium}></div>
          <div class="td users-name">${name.title}. ${name.first} ${name.last}</div>
        </div>`;
      return tmpl;
    }, '');
  }

  function propComparator(prop) {
    
    let orderDesc = (prop[0] === '-') ? -1 : 1;
    prop = ~orderDesc ? prop : prop.substring(1);
    
    let pointPosition = prop.indexOf('.');
    let propBegin = prop;
    let propEnd = prop;
    if (~pointPosition) {
      propBegin = prop.substring(0, pointPosition);
      propEnd = prop.substring(pointPosition + 1);
    }
    
    return function(a, b) {
        if (~pointPosition) {
          a = a[propBegin];
          b = b[propBegin];
        }        
        let res = (a[propEnd] < b[propEnd]) ? -1 : (a[propEnd] > b[propEnd]) ? 1 : 0;
        return orderDesc * res;
    }
  }

  function sortData(users)
  {
    let selectElem = document.getElementById('sortSelect');
    let sortValue = selectElem.options[selectElem.selectedIndex].value;
    return users.sort(propComparator(sortValue));
  }

  function processData(users)
  {
    if (!users) {
      return;
    }

    users = sortData(users);

    let newElem, oldChild = document.querySelector('.table');
    let item = document.createElement("div");

    item.className = 'table';
    item.innerHTML = `<div class="tr">
      <div class="th users-avatar">Avatar</div>
      <div class="th users-name">Users name</div>
      </div>` +
    getPostsTemplate(users);
    
    let mainNode = document.querySelector('.main');
    if (oldChild) {
      mainNode.replaceChild(item, oldChild);
    } else {
      mainNode.appendChild(item);
    }

    item.addEventListener('click', showDetailInfo, false);
  }

  function showDetailInfo(event)
  {
    let parentNode = event.target.parentNode;
    if (!parentNode || parentNode.className !== 'tr') {
      return;
    }
    show('block');
    fillDetailsForm(parentNode.dataset.index);
  }

  function show(state)
  {
    document.getElementById('popup-window').style.display = state;
    document.getElementById('wrap').style.display = state;
  }

  function addChildLi(list, val)
  {
    let newLi = document.createElement('li');
    newLi.innerHTML = val;
    list.appendChild(newLi);
  }

  function fillDetailsForm(indexArr)
  {
    let user = users[indexArr];
    let name = user.name;

    document.querySelector('#caption').innerHTML = `<b>${name.title} ${name.first} ${name.last}</b>`;
    
    let avatar = document.querySelector('#big-avatar');
    if (avatar) {
      avatar.innerHTML = `<img src=${user.picture.large}>`;
    }

    let detailsList = document.querySelector('#details-list');
    detailsList.innerHTML = '';
    
    let location = user.location;
    addChildLi(detailsList, `Street: ${location.street}`);
    addChildLi(detailsList, `City: ${location.city}`);
    addChildLi(detailsList, `State: ${location.state}`);
    addChildLi(detailsList, `E-mail: ${user.email}`);
    addChildLi(detailsList, `Phone: ${user.phone}`);
  }

}());