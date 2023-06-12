from django.contrib import admin
from .models import *

# Register your models here.
class UserAdmin(admin.ModelAdmin):
    list_display = ['id','username', 'email', 'password', "education", "followers"]

admin.site.register(User, UserAdmin)


class TweetsAdmin(admin.ModelAdmin):
    list_display = ['id','tweet_user','tweet_msg','tweet_time','tweet_likes']


admin.site.register(Tweets, TweetsAdmin) 


class FollowingAdmin(admin.ModelAdmin):
    list_display = ['user','following']


admin.site.register(Following, FollowingAdmin)

class LikesAdmin(admin.ModelAdmin):
    list_display = ['user', 'tweet']


admin.site.register(Likes, LikesAdmin)