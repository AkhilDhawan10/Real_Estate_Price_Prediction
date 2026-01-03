type FloorType = 'basement' | 'ground' | 'first' | 'second' | 'third' | 'terrace' | 'stilt';
type PropertyStatus = 'ready' | 'under_construction' | 'booking';

interface ExtractedProperty {
  location: { city: string; area: string };
  propertyId?: string;
  propertyType: 'plot' | 'flat';
  size?: { value: number; unit: 'gaj' | 'sqft' | 'yd' };
  price?: number;
  floors: FloorType[];
  bedrooms?: number;
  status?: PropertyStatus;
  contact?: string;
  brokerNotes?: string;
}

export const parseDelhiPDF = (text: string): ExtractedProperty[] => {
  const properties: ExtractedProperty[] = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  let currentArea = '';
  let currentCity = 'south delhi';

  for (const line of lines) {

    if (/DELHI/i.test(line)) {
      currentCity = line.toLowerCase();
      continue;
    }

    if (/RESIDENTIAL|SEPTEMBER|SALE/i.test(line)) continue;

    // AREA detection (forgiving)
    if (
      line.length > 4 &&
      !/\d/.test(line) &&
      !/BR|YD|FT|SQ|GAJ|PLOT/i.test(line)
    ) {
      currentArea = line.toLowerCase().replace(/\s+/g, ' ').trim();
      continue;
    }

    if (!currentArea) continue;

    console.log('PARSING:', line);

    const sizeMatch = line.match(/(\d+(?:\.\d+)?)\s*(GJ|GAJ|YD|YARD|FT|SQFT|SQ\.FT|SFT)/i);
    const sizeValue = sizeMatch ? parseFloat(sizeMatch[1]) : undefined;
    const rawUnit = sizeMatch?.[2].toUpperCase();
    const sizeUnit =
      rawUnit?.includes('G') ? 'gaj' :
      rawUnit?.includes('Y') ? 'yd' : 'sqft';

    const bedroomMatch = line.match(/(\d+)\s*(BR|BHK)/i);
    const bedrooms = bedroomMatch ? Number(bedroomMatch[1]) : undefined;

    const floors: FloorType[] = [];
    if (/BMT/i.test(line)) floors.push('basement');
    if (/GF/i.test(line)) floors.push('ground');
    if (/FF/i.test(line)) floors.push('first');
    if (/SF/i.test(line)) floors.push('second');
    if (/TF/i.test(line)) floors.push('third');
    if (/TERR/i.test(line)) floors.push('terrace');
    if (/STILT/i.test(line)) floors.push('stilt');
    if (!floors.length) floors.push('ground');

    let status: PropertyStatus | undefined;
    if (/READY/i.test(line)) status = 'ready';
    else if (/U\/C|U\/R/i.test(line)) status = 'under_construction';
    else if (/BOOKING/i.test(line)) status = 'booking';

    const contact = line.match(/\d{8,11}/g)?.join(', ');

    const priceMatch = line.match(/(?:₹|Rs\.?|@)\s*(\d+(?:\.\d+)?)/i);
    const price = priceMatch ? Number(priceMatch[1]) * 100000 : undefined;

    const propertyId = line.match(/^([A-Z]-?\d+|\d+)/i)?.[1];

    properties.push({
      location: { city: currentCity, area: currentArea },
      propertyId,
      propertyType: /PLOT/i.test(line) ? 'plot' : 'flat',
      size: sizeValue ? { value: sizeValue, unit: sizeUnit as any } : undefined,
      price,
      floors,
      bedrooms,
      status,
      contact,
      brokerNotes: line.slice(0, 300),
    });
  }

  return properties;
};
