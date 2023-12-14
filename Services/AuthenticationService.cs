using Microsoft.JSInterop;

namespace MyPWA.Services
{
    public class AuthenticationService
    {
        
        private IJSRuntime JSRuntime { get; set; }
        public bool IsLoggedIn { get; set; }
        public AuthenticationService(IJSRuntime jSRuntime) 
        {
            JSRuntime = jSRuntime;
            IsLoggedIn = false;
        }
        public async Task<bool> LogIn()
        {
            IsLoggedIn = true;
            return true;
        }
        public async Task<bool> LogOut()
        {
            try
            {
                var result = await JSRuntime.InvokeAsync<bool?>("deleteToken");
                //var result = JsonConvert.DeserializeObject<bool>(jsonResponse);
                if (result == true)
                {
                    IsLoggedIn = false;
                    return true;
                }
            }
            catch(Exception ex)
            {
                Console.WriteLine(ex.ToString());
                return false;
            }
            return false;
        }
    }
}
