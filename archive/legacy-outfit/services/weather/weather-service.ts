import type { WeatherDay } from "@/domain/types";
export interface WeatherService { getToday(city: string): Promise<WeatherDay>; getForecast(city: string, days: number): Promise<WeatherDay[]>; }

