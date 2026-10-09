import frappe
from frappe.utils import get_datetime


def is_email_content_empty(content: str | None) -> bool:
    return content is None or content.strip() == ""


def get_default_email_content(type: str) -> str:
    if type == "share_feedback":
        return """\
<p>سلام،</p>
<p>از اینکه با ما در ارتباط بودید سپاسگزاریم. خوشحال می‌شویم بازخوردتان را درباره تجربه اخیرتان از پشتیبانی تیکت شماره #{{ doc.name }} با ما در میان بگذارید.</p>
<a href="{{ url }}" class="btn btn-primary">ثبت بازخورد</a>

<p>سپاسگزاریم!<br>تیم پشتیبانی</p>"""

    if type == "acknowledgement":
        return """\
<p>سلام،</p>
<br />
<p>از اینکه با ما تماس گرفتید سپاسگزاریم. درخواست شما دریافت شد و تیکت پشتیبانی برای آن ثبت شد.</p>
<p>
    <strong>شماره تیکت:</strong> {{ doc.name }}<br />
    <strong>موضوع:</strong> {{ doc.subject }}<br />
</p>
<p>کارشناسان ما درخواست شما را بررسی می‌کنند و در کوتاه‌ترین زمان پاسخ خواهند داد.</p>
<br />
<p>با احترام،<br />تیم پشتیبانی</p>
"""

    if type == "reply_to_agents":
        return """\
<div>
  <p>سلام،</p>
  <p>پاسخ جدیدی برای تیکت شماره <strong>#{{ doc.name }}</strong> ثبت شده است.</p>
  <p><strong>موضوع:</strong> {{ doc.subject }}</p>
  <p><strong>ثبت‌کننده:</strong> {{ doc.raised_by }}</p>
  <p><strong>اولویت:</strong> {{ doc.priority }}</p>
   <div style="margin-bottom: 10px">
    <p style="margin-bottom: 20px">پیام</p>
    <div
      style="
        background: #f3f5f8;
        padding: 10px;
        border-radius: 4px;
        border: 1px solid #e5e9ee;
      "
    >
      {{ message }}
    </div>
  </div>
  <br />
  <p>
    برای مشاهده و پاسخ به این تیکت،
    <a href="{{ ticket_url }}">اینجا کلیک کنید</a>.
  </p>
  <p>با احترام،<br />تیم پشتیبانی</p>
</div>
"""

    if type == "reply_via_agent":
        return """\
<div>
  <h2><strong>تیکت شماره #{{ doc.name }}</strong></h2>
  <h3>پاسخ جدیدی برای این تیکت ثبت شده است</h3>
  <br />
  <div style="margin-bottom: 10px">
    <h3 style="margin-bottom: 20px">پیام</h3>
    <div
      style="
        background: #f3f5f8;
        padding: 10px;
        border-radius: 4px;
        border: 1px solid #e5e9ee;
      "
    >
      {{ message }}
    </div>
  </div>
  <p>برای پاسخ به این پیام، لطفاً به پرتال مشتری مراجعه کنید.</p>
  <a
    class="btn btn-primary"
    href="{{ ticket_url }}"
    rel="noopener noreferrer"
    target="_blank"
  >مشاهده در پرتال</a>
  <br />
</div>
"""


default_banner_msg = """Thanks for reaching out 👋. This ticket was created outside our working hours. You can expect the next response by {{ next_working_day }}."""


@frappe.whitelist()
def get_banner_msg():
    """Get current and default banner message for settings UI"""

    current_msg = frappe.db.get_single_value(
        "HD Settings", "outside_working_hours_message"
    )
    enabled = frappe.db.get_single_value("HD Settings", "enable_outside_hours_banner")

    return {
        "default": default_banner_msg,
        "current": current_msg or None,
        "enabled": bool(enabled),
    }


def get_rendered_banner_msg(ticket_id):
    banner_msg = frappe.db.get_single_value(
        "HD Settings", "outside_working_hours_message"
    )
    ticket = frappe.get_doc("HD Ticket", ticket_id).as_dict()
    if not banner_msg:
        banner_msg = default_banner_msg

    next_working_day = None
    next_working_date = None
    expected_response = None

    if ticket.get("response_by"):
        next_working_day_dt = get_datetime(ticket.get("response_by"))
        next_working_day = next_working_day_dt.strftime("%A, %d %b")
        next_working_date = next_working_day_dt.strftime("%d %b")
        expected_response = next_working_day_dt.strftime("%H:%M, %A, %d %b")

    context = {
        "ticket": ticket,
        "next_working_daytime": next_working_day_dt,
        "next_working_day": next_working_day,
        "next_working_date": next_working_date,
        "expected_response": expected_response,
    }

    rendered = frappe.render_template(banner_msg, context)

    return {
        "banner_msg": rendered,
    }
