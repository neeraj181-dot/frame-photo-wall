from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Frame


class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True, label='Confirm password')

    class Meta:
        model  = User
        fields = ['username', 'password', 'password2']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password2': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        return User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
        )


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ['id', 'username']


class FrameSerializer(serializers.ModelSerializer):
    image_url   = serializers.SerializerMethodField()
    uploaded_by = UserSerializer(read_only=True)

    class Meta:
        model  = Frame
        fields = [
            'id', 'slot_number',
            'image', 'image_url',
            'uploaded_by', 'uploaded_at', 'updated_at',
        ]
        read_only_fields = ['id', 'slot_number', 'uploaded_by', 'uploaded_at', 'updated_at']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None
