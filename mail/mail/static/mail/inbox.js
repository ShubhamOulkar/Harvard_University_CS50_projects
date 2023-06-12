document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#read-mail').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function read_mail(id) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#read-mail').style.display = 'block';

  document.querySelector('#read-mail').innerHTML = '';


  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          read: true,
        })
      })
      const element = document.createElement('div');
      element.innerHTML = `
    <h5>From: ${email.sender}</h5>
    <h6>To: ${email.recipients}</h6>
    <small>Sent on ${email.timestamp}</small>
    <p>Subject: ${email.subject}</p>
    <p>Body: ${email.body}</p>
    <button class="btn btn-primary" onclick="reply_mail(${email.id})">Reply</button>
    <br>
    `;
      document.querySelector('#read-mail').appendChild(element);

    });
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#read-mail').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      emails.forEach((mail) => {
        const element = document.createElement('div');
        element.id = `${mail.id}`;
        element.className = mail.read ? 'mail-read' : 'mail-unread';
        if (mailbox === 'sent') {
          element.innerHTML = `
          <a onclick="read_mail(${mail.id})"><h5>TO: ${mail.recipients}</h5>
          <p>Subject: ${mail.subject}</p>
          <small>Sent on ${mail.timestamp}</small></a>
          <br>
          `;
        } else if (mailbox === 'inbox') {
          element.innerHTML = `
          <a onclick="read_mail(${mail.id})"><h5>From: ${mail.sender}</h5>
          <p>Subject: ${mail.subject}</p>
          <small>Sent on ${mail.timestamp}</small></a>
          <button class="btn btn-primary" onclick="archive_mail(${mail.id})">Archive</button>
          <br>
          `;
        } else {
          element.innerHTML = `
          <a onclick="read_mail(${mail.id})"><h5>From: ${mail.sender}</h5>
          <p>Subject: ${mail.subject}</p>
          <small>Sent on ${mail.timestamp}</small>
          </a>
          <button class="btn btn-primary" onclick="unarchive_mail(${mail.id})">Unarchive</button>
          <br>
          `;
        }

        // element.addEventListener('click', () => read_mail(mail.id));
        document.querySelector('#emails-view').appendChild(element);
      })
    });
}

function send_email(event) {
  event.preventDefault();

  const rec = document.querySelector('#compose-recipients').value;
  const sub = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: rec,
      subject: sub,
      body: body
    })
  })
    .then(response => response.json())
    .then(result => {
      console.log(result);
      load_mailbox('sent');
    });
}

function reply_mail(id){
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#read-mail').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = email.sender;
  document.querySelector('#compose-subject').value = email.subject ? `Re:${email.subject}`:'';
  document.querySelector('#compose-body').value = email.body ? `On {${email.timestamp} ; ${email.sender}} wrote: ${email.body}`:'';
  })
}

function archive_mail(id) {
  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: true,
        })
      });
      load_mailbox('archive');
      setTimeout(() => {
        document.location.reload();
      }, 1);
    });

}

function unarchive_mail(id) {
  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: false,
        })
      });
      load_mailbox('inbox');
      setTimeout(() => {
        document.location.reload();
      }, 1);
    });
}