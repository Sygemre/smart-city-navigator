import React, { useMemo, useState, useEffect } from "react";
import { Linking, Platform, SafeAreaView, ScrollView } from "react-native";
import styled from "styled-components/native";
import { collection, getDocs, query, orderBy } from "firebase/firestore"; 
import { db } from "../services/firebaseConfig"; 
import { AILoading } from "../components/AILoading";
import { DurationSlider } from "../components/DurationSlider";
import { RouteStopsList } from "../components/RouteStopsList";
import { useDuration } from "../hooks/useDuration";
import { useRouteGenerator } from "../hooks/useRouteGenerator";
import type { VenueCategory } from "../services/placesApi";
import { hasNonEmptyString, toDisplayText } from "../utils/displayText";

const CATEGORIES = ["Sanat", "Tiyatro", "Muzik", "Gastronomi", "Tarih", "Doga"];
const CATEGORY_TO_API: Record<string, VenueCategory> = {
  Sanat: "sanat",
  Tiyatro: "tiyatro",
  Muzik: "muzik",
  Gastronomi: "gastronomi",
  Tarih: "tarih",
  Doga: "doga"
};

export function PlanOlusturScreen() {
  const { index, setIndex, selectedDuration } = useDuration(3);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([CATEGORIES[0]]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [isDbLoading, setIsDbLoading] = useState(true);

  // --- KONUM BAGIMLILIGINI KALDIRDIK ---
  const locationLoading = false;
  const lat = 41.0082; // Sabit koordinat (Sorguyu etkilemez)
  const lng = 28.9784; 
  const locationError = null;

  // Firestore'dan illeri çekme
  useEffect(() => {
    async function fetchCities() {
      try {
        const citiesCol = collection(db, "cities");
        const q = query(citiesCol, orderBy("name", "asc"));
        const citySnapshot = await getDocs(q);
        const cityList = citySnapshot.docs
          .map((doc) => doc.data().name)
          .filter((name): name is string => typeof name === "string" && name.trim().length > 0)
          .map((name) => name.trim());

        setDistricts(cityList);
        if (cityList.length > 0) {
          setSelectedDistrict(cityList[0]);
        }
      } catch (error) {
        console.error("Sehirler cekilemedi:", error);
      } finally {
        setIsDbLoading(false);
      }
    }
    fetchCities();
  }, []);

  const {
    loading: routeLoading,
    route,
    error: routeError,
    warning: routeWarning,
    generateRoute
  } = useRouteGenerator();

  const isLoading = routeLoading || isDbLoading;

  const locationLabel = useMemo(() => {
    return `${selectedDistrict || "Şehir Seçin"}, Türkiye`;
  }, [selectedDistrict]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category]
    );
  };

  const handleCreateRoute = async () => {
    if (selectedCategories.length === 0) {
      return;
    }

    // Artik direkt selectedDistrict (secilen il) uzerinden rota olusturuyoruz
    await generateRoute({
      lat,
      lng,
      city: selectedDistrict, 
      district: selectedDistrict,
      totalMinutes: selectedDuration.minutes,
      categories: selectedCategories.map((category) => CATEGORY_TO_API[category])
    });
  };

  const openEventDetail = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error("Etkinlik detayi acilamadi:", error);
    }
  };

  const openDirections = async (name: string, lat: number, lng: number) => {
    const encodedName = encodeURIComponent(name);
    const isIOS = Platform.OS === "ios";
    const primaryUrl = isIOS
      ? `https://maps.apple.com/?q=${encodedName}&daddr=${lat},${lng}`
      : `geo:0,0?q=${encodedName}@${lat},${lng}`;
    const fallbackUrl = `https://maps.google.com/?q=${lat},${lng}`;

    try {
      const canOpenPrimary = await Linking.canOpenURL(primaryUrl);
      if (canOpenPrimary) {
        await Linking.openURL(primaryUrl);
        return;
      }
      await Linking.openURL(fallbackUrl);
    } catch (error) {
      console.error("Harita acilamadi:", error);
    }
  };

  return (
    <Wrapper>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <TopLocationBadge>
            <TopLocationText>{`📍 ${locationLabel}`}</TopLocationText>
          </TopLocationBadge>

          <Hero>
            <Location>Seçtiğin şehre göre özel öneriler</Location>
            <Title>Bugün ne{`\n`}keşfedelim?</Title>
            <Subtitle>Şehir ve süreye göre kişiselleştirilmiş rota</Subtitle>
          </Hero>

          <SectionTitle>İlgi Alanı</SectionTitle>
          <HorizontalScroll horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map((item) => (
              <Chip
                key={item}
                isActive={selectedCategories.includes(item)}
                onPress={() => toggleCategory(item)}
              >
                <ChipLabel isActive={selectedCategories.includes(item)}>
                  {selectedCategories.includes(item) ? `✓ ${item}` : item}
                </ChipLabel>
              </Chip>
            ))}
          </HorizontalScroll>

          <SectionTitle>Şehir Seçimi</SectionTitle>
          <HorizontalScroll horizontal showsHorizontalScrollIndicator={false}>
            {districts.map((item) => (
              <DistrictChip
                key={item}
                isActive={item === selectedDistrict}
                onPress={() => setSelectedDistrict(item)}
              >
                <DistrictLabel isActive={item === selectedDistrict}>
                  {toDisplayText(item)}
                </DistrictLabel>
              </DistrictChip>
            ))}
          </HorizontalScroll>

          <DurationSlider value={index} onChange={setIndex} />

          <CreateButton onPress={handleCreateRoute} disabled={isLoading || selectedCategories.length === 0}>
            <CreateButtonLabel>{isLoading ? "Yükleniyor..." : "Plan Oluştur"}</CreateButtonLabel>
          </CreateButton>
          {selectedCategories.length === 0 ? (
            <WarningText>Plan olusturmak icin en az bir kategori secin.</WarningText>
          ) : null}

          {hasNonEmptyString(routeError) ? (
            <ErrorText>{toDisplayText(routeError)}</ErrorText>
          ) : null}
          {hasNonEmptyString(routeWarning) ? (
            <WarningText>{toDisplayText(routeWarning)}</WarningText>
          ) : null}

          {route !== null ? (
            <RouteStopsList
              route={route}
              onDirections={openDirections}
              onEventDetail={openEventDetail}
            />
          ) : null}
        </ScrollView>
        <AILoading active={isLoading} />
      </SafeAreaView>
    </Wrapper>
  );
}

// --- STYLED COMPONENTS (Aynen Kalabilir) ---
const Wrapper = styled.View` flex: 1; background-color: #121212; `;
const Hero = styled.View` background-color: #1C2130; padding: 24px; margin-bottom: 16px; `;
const TopLocationBadge = styled.View` margin: 6px 24px 8px; align-self: flex-start; padding: 6px 12px; border-radius: 999px; border-width: 1px; border-color: rgba(30, 207, 176, 0.35); background-color: rgba(30, 207, 176, 0.12); `;
const TopLocationText = styled.Text` color: #1ECFB0; font-size: 12px; font-weight: 600; `;
const Location = styled.Text` color: #888888; font-size: 12px; margin-bottom: 8px; `;
const Title = styled.Text` color: #FFFFFF; font-size: 40px; font-weight: 700; line-height: 44px; `;
const Subtitle = styled.Text` color: #CCCCCC; font-size: 14px; margin-top: 8px; `;
const SectionTitle = styled.Text` color: #888888; font-size: 11px; letter-spacing: 1px; margin: 0 24px 10px; text-transform: uppercase; `;
const HorizontalScroll = styled.ScrollView` padding: 0 24px; margin-bottom: 20px; `;
const Chip = styled.TouchableOpacity<{ isActive: boolean }>` padding: 8px 14px; border-radius: 24px; margin-right: 8px; border-width: 1px; border-color: ${({ isActive }) => isActive ? "rgba(255,92,53,0.5)" : "#2A2F3E"}; background-color: ${({ isActive }) => isActive ? "rgba(255,92,53,0.15)" : "#1C2130"}; `;
const ChipLabel = styled.Text<{ isActive: boolean }>` color: ${({ isActive }) => isActive ? '#FF5C35' : '#A0A0A0'}; font-size: 13px; font-weight: 600; `;
const DistrictChip = styled(Chip)<{ isActive: boolean }>` border-color: ${({ isActive }) => isActive ? "rgba(30,207,176,0.4)" : "#2A2F3E"}; background-color: ${({ isActive }) => isActive ? "rgba(30,207,176,0.12)" : "#1C2130"}; `;
const DistrictLabel = styled(ChipLabel)<{ isActive: boolean }>` color: ${({ isActive }) => isActive ? '#1ECFB0' : '#A0A0A0'}; `;
const CreateButton = styled.TouchableOpacity` background-color: #FF5C35; margin: 20px 24px 8px; padding: 16px; border-radius: 16px; align-items: center; `;
const CreateButtonLabel = styled.Text` color: white; font-size: 18px; font-weight: 700; `;
const ErrorText = styled.Text` color: #ff8b6b; margin: 4px 24px; font-size: 12px; `;
const WarningText = styled.Text` color: #f5c842; margin: 4px 24px; font-size: 12px; `;