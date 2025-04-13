using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using TeaTimeDemo;

namespace TeaTimeDemo.Hubs
{
    public class ProgressHub : Hub
    {
        public async Task SendProgressUpdate(int progress)
        {
            await Clients.All.SendAsync("ReceiveProgressUpdate", progress);
        }
    }
}