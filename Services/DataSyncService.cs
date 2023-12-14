using System.Diagnostics;
using Microsoft.JSInterop;

namespace MyPWA.Services
{
    public class DataSyncService : IDisposable
    {
        private IJSRuntime JSRuntime { get; set; }
        private DotNetObjectReference<DataSyncService> objRef;
        private bool firstCall = true;
        public bool isChecked { get; set; }
        public IEnumerable<State>? States { get; private set; }
        public IEnumerable<Device>? Devices { get; private set; }
        public IEnumerable<Device>? DisplaydDevices { get; private set; }
        public List<string>? Locations { get; private set; }

        public event Action? OnChange;
        public DataSyncService(IJSRuntime jsRuntime)
        {
            JSRuntime = jsRuntime;
            objRef = DotNetObjectReference.Create(this);
        }

        public async Task InitializeAsync()
        {
            if (firstCall)
            {
                // Register the service worker
                await JSRuntime.InvokeVoidAsync("registerServiceWorker");

                // Listen for messages from the service worker
                await JSRuntime.InvokeVoidAsync("startListening", objRef);
                //await JSRuntime.InvokeVoidAsync("navigator.serviceWorker.controller.postMessage", "setAlarmStatus");
            }
            await Task.Run(() =>
            {
                firstCall = false;
            });
        }

        [JSInvokable]
        public bool? GetAlarmSwitchStatus()
        {
            return isChecked;
        }

        [JSInvokable]
        public void SetAlarmSwitchStatus(bool value)
        {
            isChecked = value;
        }

        [JSInvokable]
        public void TestUpdate(IEnumerable<State> states, IEnumerable<Device> devices)
        {
            if (states != null)
            {
                states = states.OrderByDescending(s => s.Timestamp).ToList();
                States = states;
                if (devices != null)
                {
                    //foreach (var device in devices)   //macht der Server
                    //{
                    //    device.Laststate = States.FirstOrDefault(i => i.Deviceid == device.Deviceid).Statevalue;
                    //}
                    Devices = devices;
                }
            }
            NotifyStateChanged();
        }

        public async Task GetLocations()
        {
            //await JSRuntime.InvokeVoidAsync("navigator.serviceWorker.controller.postMessage", "fetchData");

            if (Devices != null)
            {
                Locations =
                                Devices
                                .Select(m => m.Location)
                                .OrderBy(Location => Location).Distinct().ToList();
                if (DisplaydDevices == null)
                {
                    DisplaydDevices = Devices;
                }
            }
        }

        private void NotifyStateChanged()
        {
            OnChange?.Invoke();
        }

        public async Task Filter(string? SearchString, string? DeviceLocation)
        {
            await GetLocations();
            try
            {
                if (Devices != null)
                {
                    DisplaydDevices = Devices;
                    if (!string.IsNullOrEmpty(DeviceLocation) && !DeviceLocation.Equals("Alle"))
                    {
                        Devices = Devices.Where(x => x.Location.ToLower() == DeviceLocation.ToLower()).ToList();
                    }
                    if (!string.IsNullOrEmpty(SearchString))
                    {
                        Devices = Devices.Where(s => s.Name.ToLower().Contains(SearchString.ToLower())).ToList();
                    }
                    //Geräte nach gewähltem Standort Sortieren
                    DisplaydDevices = Devices.OrderBy(d => d.Location).ThenBy(d => d.Name).ToList();
                }
                else Debug.WriteLine("Fehler beim Filtern");
                NotifyStateChanged();
                return ;
            }
            catch (Exception ex)
            {
                Debug.WriteLine(ex.ToString());
                return ;
            }
        }

        public void Dispose()
        {
            objRef?.Dispose();
        }
    }
    /*
    public class JobExecutedEventArgs : EventArgs
    {
        public JobExecutedEventArgs(IEnumerable<Device>? devices, IEnumerable<State>? states)
        {
            Devices = devices;
            States = states;
        }
        public IEnumerable<State>? States { get; set; }
        public IEnumerable<Device>? Devices { get; set; }
    }
    
    public class DataSyncService : IDisposable
    {
        private static int _instanceCount = 0;
        private System.Timers.Timer? _Timer;
        private bool _Running;
        private HttpClient Client = new();
        protected IEnumerable<State>? States { get; set; }
        protected IEnumerable<Device>? Devices { get; set; }
        public DataSyncService()
        {
            Interlocked.Increment(ref _instanceCount);
            Console.WriteLine($"SharedService instance created. Total instances: {_instanceCount}");
        }

        public event EventHandler<JobExecutedEventArgs>? JobExecuted;
        async Task OnJobExecuted()
        {
            await Task.Run(() =>
            {
                JobExecuted?.Invoke(this, new JobExecutedEventArgs(Devices, States));
            });
        }
        public async Task ExecuteAsync()
        {
            if (!_Running)
            {
                Debug.WriteLine("PeriodicExecutor started");

                await ExecuteJob();

                _Timer = new System.Timers.Timer
                {
                    Interval = 600_000  // Intervall in Sekunden: 600 bis 0 = 10 Minuten
                };
                _Timer.Elapsed += async (sender, e) => await HandleTimer(sender, e);
                _Timer.AutoReset = true;
                _Timer.Enabled = true;

                _Running = true;
            }
        }
        async Task HandleTimer(object source, ElapsedEventArgs e)
        {
            await ExecuteJob();
        }
        async Task ExecuteJob()
        {
            try
            {
                var urlStates = "https://localhost:7009/api/States";
                States = await Client.GetFromJsonAsync<IEnumerable<State>>(urlStates);
                if (States.Any())   //Nach Datum Sortieren
                {
                    await Task.Run(() =>
                                {
                                    States = States.OrderByDescending(s => s.Timestamp).ToList();
                                    States = States;
                                });
                }
                var urlDevices = "https://localhost:7009/api/Devices";
                Devices = await Client.GetFromJsonAsync<IEnumerable<Device>>(urlDevices);
                if (Devices.Any())
                {
                    if (States.Any())
                    {
                        await Task.Run(() =>
                        {
                            foreach (var device in Devices)
                            {
                                device.Value = States.FirstOrDefault(i => i.Deviceid ==device.Deviceid).Statevalue;
                            }
                        });
                    }

                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
            }
            // Notify any subscribers to the event
            await OnJobExecuted();
            Debug.WriteLine("PeriodicExecutor stopped");
        }
        public async void Dispose()
        {
            if (_Running)
            {
                await Task.Run(() =>
                {
                    _Timer?.Stop();
                    _Timer?.Dispose();
                    GC.SuppressFinalize(this);
                    _Running = false;
                });
            }
        }
    }*/
}
