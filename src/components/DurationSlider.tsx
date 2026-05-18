import React from "react";
import Slider from "@react-native-community/slider";
import styled from "styled-components/native";
import { DURATION_OPTIONS } from "../hooks/useDuration";

type Props = {
  value: number;
  onChange: (newValue: number) => void;
};

export function DurationSlider({ value, onChange }: Props) {
  return (
    <Container>
      <TopRow>
        <Label>Sure</Label>
        <ValueGroup>
          <Value>{DURATION_OPTIONS[value].label}</Value>
          <SubText>~{DURATION_OPTIONS[value].endTime}'e kadar</SubText>
        </ValueGroup>
      </TopRow>
      <StyledSlider
        value={value}
        minimumValue={0}
        maximumValue={DURATION_OPTIONS.length - 1}
        step={1}
        minimumTrackTintColor="#FF5C35"
        maximumTrackTintColor="#242B3A"
        thumbTintColor="#FFFFFF"
        onValueChange={(newValue) => onChange(newValue)}
      />
      <MarksRow>
        <Mark>1 saat</Mark>
        <Mark>3 saat</Mark>
        <Mark>5 saat</Mark>
        <Mark>Tam gun</Mark>
      </MarksRow>
    </Container>
  );
}

const Container = styled.View`
  padding: 0 24px;
`;

const TopRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const Label = styled.Text`
  color: ${({ theme }) => theme.colors.text2};
  font-size: 13px;
  font-weight: 600;
`;

const ValueGroup = styled.View`
  align-items: flex-end;
`;

const Value = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: 24px;
  font-weight: 700;
`;

const SubText = styled.Text`
  color: ${({ theme }) => theme.colors.text3};
  font-size: 11px;
`;

const StyledSlider = styled(Slider)`
  width: 100%;
  height: 36px;
`;

const MarksRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 4px;
`;

const Mark = styled.Text`
  color: ${({ theme }) => theme.colors.text3};
  font-size: 11px;
`;
