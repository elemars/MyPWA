using static MyPWA.Pages.StatesIndex;
using static MyPWA.Pages.DevicesIndex;
using System.Net.Http.Json;
using System.Runtime.CompilerServices;
using System.ComponentModel.DataAnnotations;

namespace MyPWA.Services
{
    public enum StateValue
    {
        verschlossen, angelehnt, offen, gekippt, offline
    }
    public class State
    {
        public int Stateid { get; set; } = default;

        public StateValue Statevalue { get; set; }

        public DateTime? Timestamp { get; set; }

        public int Deviceid { get; set; }
    }
    public class Device
    {
        public int Deviceid { get; set; } = default;

        public string? Location { get; set; } = null!;

        public string? Name { get; set; } = null!;

        public decimal? Batterylevel { get; set; }

        public string? Macadress { get; set; } = null!;

        public StateValue Laststate { get; set; }
    }
    public class User
    {
        public int Userid { get; set; }
        [MaxLength(16)]
        public string? Username { get; set; }
        [MaxLength(128)]
        public string? Password { get; set; }
        [MaxLength(5)]
        public string? Role { get; set; }
        [MaxLength(24)]
        public string? UID { get; set;}
    }
    public class LoginResult
    {
        public string? message { get; set; }
        public string? email { get; set; }
        public string? jwtBearer { get; set; }
        public bool success { get; set; }
    }
}
