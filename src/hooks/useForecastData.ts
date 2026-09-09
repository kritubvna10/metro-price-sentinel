import { useEffect, useState } from 'react';

/**
 * Price-forecast feed for the dashboard's "Price forecast" feature.
 *
 * The forecast is a single static JSON file (public/data/price_forecast.json),
 * regenerated offline whenever the model is retrained — there is no backend and
 * no live model call, exactly like the master CSV the rest of the dashboard
 * reads. Every value here is a next-COLLECTION estimate for a store, never a
 * per-day figure: stores are visited only once every ~3 weeks, so the model
 * cannot resolve a specific weekday.
 */

/** One product's predicted movement at a store, for the per-store detail view. */
export interface ForecastProduct {
  product_name: string;
  /** Real, measured price at the store's last collection. */
  last_actual: number;
  /** Model estimate for the store's next collection. */
  predicted: number;
  /** predicted − last_actual (signed). */
  change: number;
}

/** One store's basket forecast plus its biggest per-product movers. */
export interface ForecastStore {
  store_name: string;
  /** ISO date of the store's last real collection. */
  last_actual_date: string;
  /** Real, measured basket total at that collection. */
  last_actual_basket: number;
  /** Model estimate for the basket at the store's next collection. */
  predicted_basket: number;
  /** ISO date the store is expected to be visited next (context only). */
  expected_next_visit: string;
  products: ForecastProduct[];
}

export interface ForecastData {
  /** ISO date the forecast file was generated. */
  generated_on: string;
  /** Human-readable next-collection window, e.g. "2026-09-17 to 2026-09-21". */
  forecast_window: string;
  /** Short plain-language note about model quality. */
  model_note: string;
  stores: ForecastStore[];
}

export interface UseForecastResult {
  forecast: ForecastData | null;
  loading: boolean;
  error: string | null;
}

const FORECAST_URL = `${import.meta.env.BASE_URL}data/price_forecast.json`;

/** Narrows unknown JSON to a ForecastStore, dropping anything malformed. */
function isForecastStore(value: unknown): value is ForecastStore {
  if (typeof value !== 'object' || value === null) return false;
  const s = value as Record<string, unknown>;
  return (
    typeof s.store_name === 'string' &&
    typeof s.last_actual_basket === 'number' &&
    typeof s.predicted_basket === 'number' &&
    Array.isArray(s.products)
  );
}

/**
 * Loads the static forecast JSON once. Tolerates a missing or malformed file
 * (the feature simply doesn't render) and skips any store rows that don't parse,
 * so a partial file still shows the stores it can.
 */
export function useForecastData(): UseForecastResult {
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(FORECAST_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load forecast (${response.status})`);
        }
        return response.json();
      })
      .then((raw: unknown) => {
        if (cancelled) return;
        const obj = (raw ?? {}) as Record<string, unknown>;
        const stores = Array.isArray(obj.stores)
          ? obj.stores.filter(isForecastStore)
          : [];
        setForecast({
          generated_on: typeof obj.generated_on === 'string' ? obj.generated_on : '',
          forecast_window:
            typeof obj.forecast_window === 'string' ? obj.forecast_window : '',
          model_note: typeof obj.model_note === 'string' ? obj.model_note : '',
          stores,
        });
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load forecast');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { forecast, loading, error };
}
