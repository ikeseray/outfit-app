import type { WeatherDay } from "@/domain/types";
import type { WeatherService } from "@/services/weather/weather-service";
export class MockWeatherService implements WeatherService {
  async getToday(city: string) { return (await this.getForecast(city, 1))[0]; }
  async getForecast(_city: string, days: number): Promise<WeatherDay[]> { const base = new Date(); return Array.from({ length: days }, (_, i) => { const d = new Date(base); d.setDate(base.getDate() + i); return { date: d.toISOString().slice(0, 10), highC: 22 - i % 3, lowC: 15 - i % 2, condition: i % 3 === 2 ? "小雨" : "多云", rainProbability: i % 3 === 2 ? 65 : 20, windLevel: 2, feelsLikeC: 20 - i % 2 }; }); }
}

