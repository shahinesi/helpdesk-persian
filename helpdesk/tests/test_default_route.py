from unittest import TestCase

from helpdesk.www.helpdesk.index import get_default_route


class TestHelpdeskDefaultRoute(TestCase):
    def test_default_route_uses_desk_frontend(self):
        self.assertEqual(get_default_route(), "/desk/helpdesk")
