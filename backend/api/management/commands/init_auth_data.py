import os

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand


def parse_bool(value, default=False):
    if value is None:
        return default

    return str(value).strip().lower() in {'1', 'true', 'yes', 'on', 'y'}


class Command(BaseCommand):
    help = 'Initialize auth data (superuser and demo users) in an idempotent way.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Initializing auth data...'))

        created = 0

        create_superuser = parse_bool(os.getenv('INIT_CREATE_SUPERUSER', '1'), default=True)
        create_demo_users = parse_bool(os.getenv('INIT_CREATE_DEMO_USERS', '0'), default=False)

        if create_superuser:
            username = os.getenv('INIT_ADMIN_USERNAME', 'admin')
            password = os.getenv('INIT_ADMIN_PASSWORD', 'cmcc@tj10086')
            email = os.getenv('INIT_ADMIN_EMAIL', 'admin@example.com')

            user, is_created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'is_active': True,
                    'is_staff': True,
                    'is_superuser': True
                }
            )

            if is_created:
                user.set_password(password)
                user.save(update_fields=['password'])
                self.stdout.write(self.style.SUCCESS(f'Superuser created: {username}'))
                created += 1
            else:
                updates = []
                if not user.is_staff:
                    user.is_staff = True
                    updates.append('is_staff')
                if not user.is_superuser:
                    user.is_superuser = True
                    updates.append('is_superuser')
                if not user.is_active:
                    user.is_active = True
                    updates.append('is_active')
                if email and user.email != email:
                    user.email = email
                    updates.append('email')
                if password and not user.check_password(password):
                    user.set_password(password)
                    updates.append('password')

                if updates:
                    user.save(update_fields=updates)
                    self.stdout.write(self.style.WARNING(f'Superuser updated: {username} ({", ".join(updates)})'))
                else:
                    self.stdout.write(self.style.NOTICE(f'Superuser exists: {username}'))

        if create_demo_users:
            demo_users = [
                {
                    'is_staff': True,
                    'is_superuser': True,
                    'password': '123456',
                    'username': 'Super'
                },
                {
                    'is_staff': True,
                    'is_superuser': False,
                    'password': '123456',
                    'username': 'Admin'
                },
                {
                    'is_staff': False,
                    'is_superuser': False,
                    'password': '123456',
                    'username': 'User'
                }
            ]

            for item in demo_users:
                username = item['username']
                password = item['password']

                user, is_created = User.objects.get_or_create(
                    username=username,
                    defaults={
                        'is_active': True,
                        'is_staff': item['is_staff'],
                        'is_superuser': item['is_superuser']
                    }
                )

                if is_created:
                    user.set_password(password)
                    user.save(update_fields=['password'])
                    self.stdout.write(self.style.SUCCESS(f'Demo user created: {username}'))
                    created += 1
                else:
                    updates = []
                    if user.is_staff != item['is_staff']:
                        user.is_staff = item['is_staff']
                        updates.append('is_staff')
                    if user.is_superuser != item['is_superuser']:
                        user.is_superuser = item['is_superuser']
                        updates.append('is_superuser')
                    if not user.is_active:
                        user.is_active = True
                        updates.append('is_active')
                    if password and not user.check_password(password):
                        user.set_password(password)
                        updates.append('password')

                    if updates:
                        user.save(update_fields=updates)
                        self.stdout.write(self.style.WARNING(f'Demo user updated: {username} ({", ".join(updates)})'))
                    else:
                        self.stdout.write(self.style.NOTICE(f'Demo user exists: {username}'))

        self.stdout.write(self.style.SUCCESS(f'Auth data initialization complete, created {created} user(s).'))
