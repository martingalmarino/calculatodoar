export function litrosPor100DesdeKmL(kmPorLitro: number) {
  if (!(kmPorLitro > 0)) return null;
  return 100 / kmPorLitro;
}

export function kmPorLitroDesdeL100(litrosPor100: number) {
  if (!(litrosPor100 > 0)) return null;
  return 100 / litrosPor100;
}

export type CostoViajeResult =
  | {
      ok: true;
      km: number;
      consumoL100km: number;
      precioLitro: number;
      idaYVuelta: boolean;
      kmTotales: number;
      litros: number;
      costoCombustible: number;
      peajes: number;
      costo: number;
      personas: number;
      costoPorPersona: number;
    }
  | { ok: false; error: string };

export function costoViaje(i: {
  km: number;
  consumoL100km?: number | null;
  kmPorLitro?: number | null;
  precioLitro: number;
  idaYVuelta?: boolean;
  personas?: number;
  peajes?: number;
}): CostoViajeResult {
  const km = Math.max(0, i.km);
  const precioLitro = i.precioLitro;
  if (!(km > 0)) return { ok: false, error: "Ingresá los kilómetros del viaje." };
  if (!(precioLitro > 0) || Number.isNaN(precioLitro)) {
    return { ok: false, error: "Cargá el precio del litro." };
  }

  let consumoL100km = i.consumoL100km ?? null;
  if ((consumoL100km == null || !(consumoL100km > 0)) && i.kmPorLitro != null && i.kmPorLitro > 0) {
    consumoL100km = litrosPor100DesdeKmL(i.kmPorLitro);
  }
  if (consumoL100km == null || !(consumoL100km > 0)) {
    return { ok: false, error: "Cargá el consumo (l/100 km o km/l)." };
  }

  const idaYVuelta = !!i.idaYVuelta;
  const kmTotales = idaYVuelta ? km * 2 : km;
  const litros = kmTotales * consumoL100km / 100;
  const costoCombustible = litros * precioLitro;
  const peajes = Math.max(0, i.peajes ?? 0);
  const costo = costoCombustible + peajes;
  const personas = Math.max(1, Math.floor(i.personas ?? 1));

  return {
    ok: true,
    km,
    consumoL100km,
    precioLitro,
    idaYVuelta,
    kmTotales,
    litros,
    costoCombustible,
    peajes,
    costo,
    personas,
    costoPorPersona: costo / personas,
  };
}

export type CompararGncResult =
  | {
      ok: true;
      km: number;
      litrosNafta: number;
      costoNafta: number;
      m3Gnc: number;
      costoGnc: number;
      ahorro: number;
      ahorroPorKm: number;
      costoEquipo: number | null;
      kmRecupero: number | null;
      noSeRecupera: boolean;
    }
  | { ok: false; error: string };

export function compararGNC(i: {
  km: number;
  consumoNafta: number;
  precioNafta: number;
  consumoGNCm3100km: number;
  precioM3: number;
  costoEquipo?: number | null;
}): CompararGncResult {
  const km = Math.max(0, i.km);
  if (!(km > 0)) return { ok: false, error: "Ingresá los kilómetros." };
  if (!(i.consumoNafta > 0) || Number.isNaN(i.precioNafta) || !(i.precioNafta > 0)) {
    return { ok: false, error: "Cargá consumo y precio de nafta/gasoil." };
  }
  if (!(i.consumoGNCm3100km > 0) || Number.isNaN(i.precioM3) || !(i.precioM3 > 0)) {
    return { ok: false, error: "Cargá consumo y precio de GNC." };
  }

  const litrosNafta = km * i.consumoNafta / 100;
  const costoNafta = litrosNafta * i.precioNafta;
  const m3Gnc = km * i.consumoGNCm3100km / 100;
  const costoGnc = m3Gnc * i.precioM3;
  const ahorro = costoNafta - costoGnc;
  const ahorroPorKm = (i.consumoNafta / 100) * i.precioNafta - (i.consumoGNCm3100km / 100) * i.precioM3;
  const costoEquipo = i.costoEquipo != null && i.costoEquipo > 0 ? i.costoEquipo : null;
  const noSeRecupera = ahorroPorKm <= 0;
  const kmRecupero = !noSeRecupera && costoEquipo != null ? costoEquipo / ahorroPorKm : null;

  return {
    ok: true,
    km,
    litrosNafta,
    costoNafta,
    m3Gnc,
    costoGnc,
    ahorro,
    ahorroPorKm,
    costoEquipo,
    kmRecupero,
    noSeRecupera,
  };
}
