
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("register/", views.register, name="register"),
    path("user/<int:id>", views.user_information, name="user_info"),
    path("write/", views.write_tweet, name='write_tweet'),
    path("edit/<int:id>", views.edit_tweet),
    path("follow/", views.following),
    path("unfollowing/", views.unfollowing),
    path("myFollowingPost/", views.login_user_following, name='my_followings_post'),
    path("liketweet/", views.like_tweet),
    path("disliketweet/", views.dislike_tweet),
]
