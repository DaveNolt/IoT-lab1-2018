# IoT-lab1-2018

## Example `config.json`

```JSON
{
    "ubidots": {
        "req_options": {
            "host": "things.ubidots.com",
            "path": "/api/v1.6/devices/mckunda-pc/?token={TOKEN}",
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "Content-Length": 0
            }
        },

        "vars": {
            "temperature": "cpu-temp",
            "ram_usage": "ram-usage",
            "ram_free": "ram-free"
        }
    },

    "thingsspeak": {
        "api_key": "*************",
        "req_options": {
            "host": "api.thingspeak.com",
            "path": "/update"
        }
    }
}
```
