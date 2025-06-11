async function changeStatus (orderID, currentStatus)
{
    let num = 0;
    if (currentStatus === 'Yet to start')
    {
        num = 0;
    }
    else if (currentStatus === 'Cooking')
    {
        num = 1;
    }
    else return;

    data = {orderID : orderID, num : num};
    const start = await fetch('/chef/status', {method : "PATCH" ,headers: {
        'Content-Type': 'application/json'
        }, body : JSON.stringify(data)});

    window.location.reload();
}