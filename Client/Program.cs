using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using MyPWA.Services;

namespace MyPWA
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebAssemblyHostBuilder.CreateDefault(args);

            builder.RootComponents.Add<App>("#app");
            builder.RootComponents.Add<HeadOutlet>("head::after");

            builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri("https://localhost:7009"/*builder.HostEnvironment.BaseAddress*/) });

            builder.Services.AddSingleton<DataSyncService>();
            builder.Services.AddSingleton<User>();
            builder.Services.AddSingleton<AuthenticationService>();

            await builder.Build().RunAsync();
        }
    }
}