import { HardwareReading, ThingSpeakConfig } from '../types';
import { generateHistoricalMockReadings, generateLatestMockReading } from './mockDataGenerator';

export interface ThingSpeakFeedItem {
  created_at: string;
  entry_id: number;
  field1?: string | null;
  field2?: string | null;
  field3?: string | null;
  field4?: string | null;
  field5?: string | null;
  field6?: string | null;
  field7?: string | null;
  field8?: string | null;
  [key: string]: unknown;
}

export interface ThingSpeakChannelInfo {
  id: number;
  name: string;
  description?: string;
  latitude?: string;
  longitude?: string;
  field1?: string;
  field2?: string;
  field3?: string;
  field4?: string;
  field5?: string;
  field6?: string;
  field7?: string;
  field8?: string;
  created_at?: string;
  updated_at?: string;
  last_entry_id?: number;
}

export interface ThingSpeakResponse {
  channel: ThingSpeakChannelInfo;
  feeds: ThingSpeakFeedItem[];
}

/**
 * Validates and converts incoming sensor values safely without dropping valid MATLAB numerical outputs
 */
function parseNumericValue(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  if (isNaN(num) || !isFinite(num)) return null;
  return Number(num.toFixed(3));
}

/**
 * Parses a raw ThingSpeak feed item using custom field mapping and channel metadata
 */
export function parseFeedItem(
  feed: ThingSpeakFeedItem,
  config: ThingSpeakConfig,
  channelInfo?: ThingSpeakChannelInfo
): HardwareReading {
  const isSiChannel = Boolean(config.siChannelId && config.channelId === config.siChannelId);
  const fieldMapping = config.fieldMapping || (isSiChannel ? config.siFieldMapping : config.sicFieldMapping) || {
    powerLossField: 3,
    efficiencyField: 4,
    temperatureField: 5,
    batteryUtilizationField: 6,
  };

  const rawEfficiency = feed[`field${fieldMapping.efficiencyField}` as keyof ThingSpeakFeedItem];
  const rawPowerLoss = feed[`field${fieldMapping.powerLossField}` as keyof ThingSpeakFeedItem];
  const rawBattery = feed[`field${fieldMapping.batteryUtilizationField}` as keyof ThingSpeakFeedItem];
  const rawTemp = feed[`field${fieldMapping.temperatureField}` as keyof ThingSpeakFeedItem];

  let efficiency = parseNumericValue(rawEfficiency);
  let powerLoss = parseNumericValue(rawPowerLoss);
  let batteryUtilization = parseNumericValue(rawBattery);
  const temperature = parseNumericValue(rawTemp);

  // Fallback defaults for SiC simulation only if telemetry fields are missing/null
  if (!isSiChannel) {
    if (efficiency === null) efficiency = 93.8;
    if (powerLoss === null) powerLoss = 0.35;
    if (batteryUtilization === null) batteryUtilization = 25.0;
  }

  return {
    entryId: feed.entry_id,
    timestamp: feed.created_at || new Date().toISOString(),
    efficiency,
    powerLoss,
    batteryUtilization,
    temperature,
    rawValues: {
      field1: feed.field1 ?? null,
      field2: feed.field2 ?? null,
      field3: feed.field3 ?? null,
      field4: feed.field4 ?? null,
      field5: feed.field5 ?? null,
      field6: feed.field6 ?? null,
      field7: feed.field7 ?? null,
      field8: feed.field8 ?? null,
    },
    channelMetadata: channelInfo ? {
      id: channelInfo.id,
      name: channelInfo.name,
      field1: channelInfo.field1,
      field2: channelInfo.field2,
      field3: channelInfo.field3,
      field4: channelInfo.field4,
      field5: channelInfo.field5,
      field6: channelInfo.field6,
      field7: channelInfo.field7,
      field8: channelInfo.field8,
      updated_at: channelInfo.updated_at,
    } : undefined,
    isMock: false,
  };
}

/**
 * Fetches latest reading and channel metadata from ThingSpeak
 */
export async function fetchLatestThingSpeakReading(
  config: ThingSpeakConfig
): Promise<{ reading: HardwareReading; raw?: unknown; channelInfo?: ThingSpeakChannelInfo; error?: string }> {
  const channelId = config.channelId?.trim();

  if (!channelId || channelId === 'YOUR_CHANNEL_ID') {
    if (config.useMockFallback) {
      return { reading: generateLatestMockReading() };
    }
    return {
      reading: {
        entryId: 0,
        timestamp: new Date().toISOString(),
        efficiency: null,
        powerLoss: null,
        batteryUtilization: null,
        temperature: null,
        isMock: false,
      },
      error: 'ThingSpeak Channel ID is not configured.',
    };
  }

  try {
    const url = new URL(`https://api.thingspeak.com/channels/${channelId}/feeds/last.json`);
    if (config.readApiKey && config.readApiKey.trim() !== '' && config.readApiKey !== 'YOUR_READ_API_KEY') {
      url.searchParams.set('api_key', config.readApiKey.trim());
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const response = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`ThingSpeak HTTP ${response.status}: ${response.statusText}`);
    }

    const data: ThingSpeakFeedItem = await response.json();
    if (!data || Object.keys(data).length === 0 || data.entry_id === undefined) {
      throw new Error('No telemetry feed found on this channel.');
    }

    const reading = parseFeedItem(data, config);
    return { reading, raw: data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown telemetry connection error';
    
    if (config.useMockFallback) {
      const mockReading = generateLatestMockReading();
      return { reading: mockReading, error: message };
    }

    return {
      reading: {
        entryId: 0,
        timestamp: new Date().toISOString(),
        efficiency: null,
        powerLoss: null,
        batteryUtilization: null,
        temperature: null,
        isMock: false,
      },
      error: message,
    };
  }
}

/**
 * Fetches historical feeds and channel metadata from ThingSpeak
 */
export async function fetchHistoricalThingSpeakFeeds(
  config: ThingSpeakConfig,
  resultsCount: number = 100
): Promise<{ feeds: HardwareReading[]; channelInfo?: ThingSpeakChannelInfo; error?: string }> {
  const channelId = config.channelId?.trim();

  if (!channelId || channelId === 'YOUR_CHANNEL_ID') {
    if (config.useMockFallback) {
      return { feeds: generateHistoricalMockReadings(resultsCount) };
    }
    return { feeds: [], error: 'ThingSpeak Channel ID is not configured.' };
  }

  try {
    const url = new URL(`https://api.thingspeak.com/channels/${channelId}/feeds.json`);
    url.searchParams.set('results', Math.min(8000, Math.max(1, resultsCount)).toString());
    
    if (config.readApiKey && config.readApiKey.trim() !== '' && config.readApiKey !== 'YOUR_READ_API_KEY') {
      url.searchParams.set('api_key', config.readApiKey.trim());
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`ThingSpeak HTTP ${response.status}: ${response.statusText}`);
    }

    const data: ThingSpeakResponse = await response.json();
    if (!data || !Array.isArray(data.feeds)) {
      throw new Error('Invalid response structure received from ThingSpeak.');
    }

    const parsedFeeds = data.feeds.map(feed => parseFeedItem(feed, config, data.channel));
    return { feeds: parsedFeeds, channelInfo: data.channel };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch historical feeds';
    if (config.useMockFallback) {
      return {
        feeds: generateHistoricalMockReadings(resultsCount),
        error: message,
      };
    }
    return { feeds: [], error: message };
  }
}

/**
 * Tests connection to a ThingSpeak channel
 */
export async function testThingSpeakConnection(
  channelId: string,
  readApiKey?: string
): Promise<{ success: boolean; message: string; channelName?: string; fieldLabels?: Record<string, string> }> {
  if (!channelId || channelId.trim() === '') {
    return { success: false, message: 'Please enter a valid Channel ID.' };
  }

  try {
    const url = new URL(`https://api.thingspeak.com/channels/${channelId.trim()}/feeds.json`);
    url.searchParams.set('results', '1');
    if (readApiKey && readApiKey.trim() !== '') {
      url.searchParams.set('api_key', readApiKey.trim());
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.status === 404) {
      return { success: false, message: 'Channel not found (HTTP 404). Check Channel ID.' };
    }
    if (response.status === 401 || response.status === 403) {
      return { success: false, message: 'Unauthorized (HTTP ' + response.status + '). A valid Read API Key is required.' };
    }
    if (!response.ok) {
      return { success: false, message: `Server error: ${response.status} ${response.statusText}` };
    }

    const data: ThingSpeakResponse = await response.json();
    if (!data || !data.channel) {
      return { success: false, message: 'Access denied or empty response from channel.' };
    }

    const fieldLabels: Record<string, string> = {};
    if (data.channel.field1) fieldLabels.field1 = data.channel.field1;
    if (data.channel.field2) fieldLabels.field2 = data.channel.field2;
    if (data.channel.field3) fieldLabels.field3 = data.channel.field3;
    if (data.channel.field4) fieldLabels.field4 = data.channel.field4;

    return {
      success: true,
      message: `Connected successfully to channel "${data.channel.name || channelId}"!`,
      channelName: data.channel.name,
      fieldLabels,
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Failed to reach ThingSpeak API.',
    };
  }
}
