document.addEventListener('DOMContentLoaded', function () {

    load_tweets();
});

function load_tweets() {
    document.querySelector('#user-info').style.display = 'none';
    document.querySelector('#tweet-feed').style.display = 'block';
    document.querySelector('#edit-tweet').style.display = 'none';
    document.querySelector('#login-user-following-list').style.display = 'none';
    document.querySelector('#pagination').style.display = 'block';
}


function user_info(id) {
    document.querySelector('#user-info').style.display = 'block';
    document.querySelector('#tweet-feed').style.display = 'none';
    document.querySelector('#edit-tweet').style.display = 'none';
    document.querySelector('#login-user-following-list').style.display = 'none';
    document.querySelector('#pagination').style.display = 'none';

    fetch(`/user/${id}`, { method: "GET" })
        .then(response => response.json())
        .then(user => {
            document.querySelector('#username').innerHTML = user.username;
            document.querySelector('#place').innerHTML = user.place;
            document.querySelector('#followers').innerHTML = user.followers_count;
            document.querySelector('#following').innerHTML = user.following_count;
            document.querySelector('#education').innerHTML = user.education;
            document.querySelector('#tweets').innerHTML = user.tweets_count;
            document.querySelector('#profile-id').innerHTML = user.user_id;

            const image = document.querySelector('#user-image');
            image.setAttribute('src', `${user.image}`);

            if (user.user_id == user.current_user) {
                document.querySelector('#follow-btn').style.display = 'none';
                document.querySelector('#unfollow-btn').style.display = 'none';
            } else {
                if (user.follow) {
                    document.querySelector('#unfollow-btn').style.display = 'block';
                    document.querySelector('#follow-btn').style.display = 'none';
                } else {
                    document.querySelector('#follow-btn').style.display = 'block';
                    document.querySelector('#unfollow-btn').style.display = 'none';
                }
            }

            let user_tweets = user.tweets;

            user_tweets.forEach((tweet) => {
                const element = document.createElement('div');
                date = new Date(tweet.date).toDateString();
                element.innerHTML = `
                    <div class="d-flex p-3 border-bottom">
                    <img src="${user.image}" class="rounded-circle" height="50" width="50"
                    alt="Avatar" loading="lazy" />
                    <div class="d-flex w-100 ps-3">
                        <div>
                        <a>
                        <h6 class="text-body">
                                ${tweet.username}
                                <span class="small text-muted font-weight-normal"> • </span>
                                <span class="small text-muted font-weight-normal">${date}</span>
                            </h6>
                        </a>
                        <p style="line-height: 1.2;"> ${tweet.msg} </p>
                        <ul class="list-unstyled d-flex px-4">
                            <li class="px-4"><i class="far fa-heart"></i><span class="small px-1">${tweet.likes}</span></li>
                        </ul>
                        </div>
                    </div>
                    </div> `
                document.querySelector('#user-tweets').appendChild(element);
            });
        });
}

function edit_tweet(id) {
    document.querySelector('#user-info').style.display = 'none';
    document.querySelector('#tweet-feed').style.display = 'none';
    document.querySelector('#edit-tweet').style.display = 'block';
    document.querySelector('#login-user-following-list').style.display = 'none';
    document.querySelector('#pagination').style.display = 'none';

    fetch(`edit/${id}`, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(msg => {
            document.querySelector('#ss').innerHTML = msg.msg;
        })

    const element = document.querySelector('#editform')
    element.setAttribute('action', `edit/${id}`)
}


function following(id) {

    const request_user_id = id;
    const profile_follow_id = document.querySelector('#profile-id').innerHTML;

    fetch('/follow/', {
        method: 'PUT',
        headers: {'X-CSRFToken': csrftoken},
        mode: 'same-origin' ,  // Do not send CSRF token to another domain.
        body: JSON.stringify({
            user: request_user_id,
            following: profile_follow_id,
        })
    });
    user_info(id = profile_follow_id)
}


function unfollowing(id) {

    const request_user_id = id;
    const profile_follow_id = document.querySelector('#profile-id').innerHTML;

    fetch('/unfollowing/', {
        method: 'PUT',
        headers: {'X-CSRFToken': csrftoken},
        mode: 'same-origin' ,  // Do not send CSRF token to another domain.
        body: JSON.stringify({
            user: request_user_id,
            following: profile_follow_id,
        })
    });
    user_info(id = profile_follow_id);
}


function login_user_following_list_view() {
    document.querySelector('#user-info').style.display = 'none';
    document.querySelector('#tweet-feed').style.display = 'none';
    document.querySelector('#edit-tweet').style.display = 'none';
    document.querySelector('#login-user-following-list').style.display = 'block';
    document.querySelector('#pagination').style.display = 'none';

    fetch('/myFollowingPost/', { method: 'GET' })
        .then(response => response.json())
        .then(users_tweets => {

            let tweets = users_tweets;

            tweets.forEach(tweet => {
                const element = document.createElement('div');
                date = new Date(tweet.time).toDateString();
                element.innerHTML = `
                <div class="d-flex p-3 border-bottom">
                <img src="${tweet.image}" class="rounded-circle" height="50" width="50"
                alt="Avatar" loading="lazy" />
                <div class="d-flex w-100 ps-3">
                    <div>
                    <a onclick='user_info(${tweet.id})'>
                    <h6 class="text-body">
                            ${tweet.username}
                            <span class="small text-muted font-weight-normal"> • </span>
                            <span class="small text-muted font-weight-normal">${date}</span>
                        </h6>
                    </a>
                    <p style="line-height: 1.2;"> ${tweet.msg} </p>
                    <ul class="list-unstyled d-flex px-4">
                    <li class="px-4" id="like-btn">
                    <a onclick="liketweet(user_id = ${tweet.id}, tweet_id=${tweet.tweet_id})"
                        onmouseover="this.style.color='blue'"
                        onmouseout="this.style.color='skyblue'" style="color: skyblue;">
                        <i class="fa-solid fa-thumbs-up"></i>
                    </a>
                    <span class="small px-1">${tweet.likes}</span>
                </li>
                    </ul>
                    </div>
                </div>
                </div> `
                document.querySelector('#following-tweets').appendChild(element);
            });

        })
}


function liketweet(user_id, tweet_id) {
    fetch('/liketweet/', {
        method: 'PUT',
        headers: {'X-CSRFToken': csrftoken},
        mode: 'same-origin' ,  // Do not send CSRF token to another domain.
        body: JSON.stringify({
            user: user_id,
            tweet: tweet_id,
        })
    });

    load_tweets();
    setTimeout(() => {
        document.location.reload();
      }, 1);
}


function disliketweet (user_id, tweet_id){
    fetch('/disliketweet/', {
        method: 'PUT',
        headers: {'X-CSRFToken': csrftoken},
        mode: 'same-origin' ,  // Do not send CSRF token to another domain.
        body: JSON.stringify({
            user: user_id,
            tweet: tweet_id,
        })
    });
    load_tweets();
    setTimeout(() => {
        document.location.reload();
      }, 1);
}

// Get csrf token 
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('network_csrf');

