async function changeStatus (paymentID, currentStatus)
{
    let num = 0;
    if (currentStatus === 'Pending')
    {
        num = 0;
    }
    else if (currentStatus === 'Completed')
    {
        num = 1;
    }
    else return;

    data = {paymentID : paymentID, num : num};
    const start = await fetch('/admin/status', {method : "PATCH" ,headers: {
        'Content-Type': 'application/json'
        }, body : JSON.stringify(data)});

    window.location.reload();
}