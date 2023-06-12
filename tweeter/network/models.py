from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ...
    education = models.CharField(null=True, max_length=50, blank=True)
    followers = models.IntegerField(default=0, blank=True) # development purpose 
    image_url = models.URLField(null=True, blank=True)
    place = models.CharField(null=True, blank=True, max_length=100)
    following = models.BigIntegerField(default=0,blank=True) # development purpose 
    ...
    REQUIRED_FIELDS = ["education", "image_url", "place"]


class Tweets(models.Model):
    tweet_user = models.ForeignKey(User, on_delete=models.CASCADE)
    tweet_msg = models.TextField(blank=True, max_length=600)
    tweet_time = models.DateTimeField(auto_now_add=True)
    tweet_likes = models.IntegerField(default=0, blank=True) 

    def __str__(self):
        return str(self.pk) + f":{self.tweet_user.username}"


class Following(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user', blank=True, null=True)
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name='follow', blank=True, null=True)

    def __str__(self):
        return str(self.user.pk) + f":{self.following.pk}"
    

class Likes(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    tweet = models.ForeignKey(Tweets, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return str(self.user.pk) + f":{self.tweet.pk}"