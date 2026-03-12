from rest_framework.authentication import TokenAuthentication


class BearerTokenAuthentication(TokenAuthentication):
    """Support `Authorization: Bearer <token>` for DRF token auth."""

    keyword = 'Bearer'
