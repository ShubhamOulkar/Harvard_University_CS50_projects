from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.http import JsonResponse
from .models import User, Following, Tweets, Likes
import json
from django.views.decorators.csrf import csrf_exempt, requires_csrf_token
from django.core.paginator import Paginator


def index(request):
    tweets = Tweets.objects.all().order_by('-tweet_time')
    paginator = Paginator(tweets, 10)
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)
    if not request.user.is_authenticated :
        return render(request, "network/index.html", {'tweets':page_obj ,})
    else :
        current_user = User.objects.get(pk=request.user.id)
        user_like_check = Likes.objects.filter(user=current_user)

        tweet_liked_list = []
        for tweet_like in range(user_like_check.count()):
            tweet_id = user_like_check[tweet_like].tweet.id
            tweet_liked_list.append(tweet_id)

        return render(request, "network/index.html", {'tweets':page_obj, 'likes':tweet_liked_list})


@login_required
def login_user_following(request):
    if request.method == 'GET':
        login_user = User.objects.get(pk=request.user.id)
        login_user_follow_list = Following.objects.filter(user=login_user) 
        login_user_follow_count = Following.objects.filter(user=login_user).count()
        followings = []
        for i in range(login_user_follow_count):
            id = login_user_follow_list[i].following
            followings.append(id)

        users_tweets = []

        for user in followings:
            user_all_tweets = Tweets.objects.filter(tweet_user = user).order_by('-tweet_time')
            for tweet in user_all_tweets:
                user_tweet = {
                    'id': user.id,
                    'tweet_id':tweet.pk,
                    'username':user.username,
                    'image': user.image_url,
                    'msg':tweet.tweet_msg,
                    'time':tweet.tweet_time,
                    'likes':tweet.tweet_likes,
                }
                users_tweets.append(user_tweet)

        users_tweets = sorted(users_tweets, key = lambda i : i['time'], reverse=True)

        user_like_check = Likes.objects.filter(user=login_user)
        ## TODO
        tweet_liked_list = []
        for tweet_like in range(user_like_check.count()):
            print(tweet_like)
            tweet_id = user_like_check[tweet_like].tweet.id
            tweet_liked_list.append(tweet_id)

    return JsonResponse(users_tweets, safe=False)


@login_required
def write_tweet(request):
    if request.method == 'POST':
        msg = request.POST['msg']
        db_tweet = Tweets()
        db_tweet.tweet_user = request.user
        db_tweet.tweet_msg = msg
        db_tweet.save()
    return HttpResponseRedirect(reverse("index"))


@login_required
def edit_tweet(request, id):
    if request.method == "GET":
        tweet_info = Tweets.objects.get(pk=id)
        tweet_msg = {'msg':tweet_info.tweet_msg}
        return JsonResponse(tweet_msg)
    
    if request.method == "POST":
        old_tweet = Tweets.objects.get(pk=id)
        new_msg = request.POST['msg']
        old_tweet.tweet_msg = new_msg
        old_tweet.save()
    return HttpResponseRedirect(reverse("index"))


def following(request):
    if request.method == 'PUT':
        data = json.loads(request.body)
        user = User.objects.get(pk=data['user'])
        following = User.objects.get(pk=data['following'])
        db_following = Following()
        db_following.user = user
        db_following.following = following
        db_following.save()
    return JsonResponse('success', safe=False)



def unfollowing(request):
    if request.method == 'PUT':
        data = json.loads(request.body)
        Following.objects.filter(user=data['user'], following=data['following']).delete()
    return JsonResponse('success', safe=False)


@login_required
def like_tweet(request):
    if request.method == 'PUT':
        data = json.loads(request.body)
        user = User.objects.get(pk=data['user'])
        tweet = Tweets.objects.get(pk=data['tweet'])
        tweet.tweet_likes = tweet.tweet_likes + 1
        tweet.save()
        db_likes = Likes()
        db_likes.user = user
        db_likes.tweet = tweet
        db_likes.save()
    return JsonResponse('success', safe=False)


@login_required
def dislike_tweet(request):
    if request.method == 'PUT':
        data = json.loads(request.body)
        user = User.objects.get(pk=data['user'])
        tweet = Tweets.objects.get(pk=data['tweet'])
        tweet.tweet_likes = tweet.tweet_likes - 1
        tweet.save()
        Likes.objects.filter(user=user, tweet=tweet).delete()
    return JsonResponse('success', safe=False)


def user_information(request, id):
    if request.method == "GET":
        user = User.objects.get(pk=id)
        following_list = Following.objects.filter(user_id=id)
        followers_list = Following.objects.filter(following_id=id)
        tweets_count = Tweets.objects.filter(tweet_user=user).count()
        user_tweets = Tweets.objects.filter(tweet_user=user).order_by('-tweet_time')
        current_user = request.user.id
        tweets = []
        for i in range(tweets_count):
            tweet = {
            'username':user_tweets[i].tweet_user.username,
            'tweet_image': user_tweets[i].tweet_user.image_url,
            'date': user_tweets[i].tweet_time,
            'likes': user_tweets[i].tweet_likes,
            'msg': user_tweets[i].tweet_msg,
            }
            tweets.append(tweet)

        current_user_following_list = Following.objects.filter(user_id=current_user)
        current_user_following_count = Following.objects.filter(user_id=current_user).count()
        followings = []
        for i in range(current_user_following_count):
            id = current_user_following_list[i].following.id
            followings.append(id)

        if user.pk in followings:
            following = True
        else:
            following = False
           

        user = {
            'user_id':user.pk,
            'username': user.username,
            'place': user.place,
            'image':user.image_url,
            'education':user.education,
            "followers_count":followers_list.count(),
            'following_count':following_list.count(),
            'follow':following,
            'tweets_count':tweets_count,
            'tweets':tweets,
            'current_user':current_user,
        }
        return JsonResponse(user)


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]
        profession = request.POST['profession']
        place = request.POST['place']

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.place = place
            user.education = profession
            user.image_url = request.POST['url']
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

