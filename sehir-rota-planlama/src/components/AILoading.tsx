import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing } from "react-native";
import styled from "styled-components/native";

const AI_MESSAGES = [
  "Besiktas'taki etkinlikler taraniyor",
  "Yakin mesafeli mekanlar hesaplanıyor",
  "Puan ve yorumlar degerlendiriliyor",
  "En iyi rota optimize ediliyor"
];

type Props = {
  active: boolean;
};

export function AILoading({ active }: Props) {
  const [messageIndex, setMessageIndex] = useState(0);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const dots = useRef([
    new Animated.Value(0.2),
    new Animated.Value(0.2),
    new Animated.Value(0.2)
  ]).current;

  useEffect(() => {
    if (!active) return undefined;

    const spinLoop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true
      })
    );

    const dotsLoop = Animated.loop(
      Animated.stagger(
        180,
        dots.map((dot) =>
          Animated.sequence([
            Animated.timing(dot, { toValue: 1, duration: 260, useNativeDriver: true }),
            Animated.timing(dot, { toValue: 0.2, duration: 260, useNativeDriver: true })
          ])
        )
      )
    );

    spinLoop.start();
    dotsLoop.start();

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % AI_MESSAGES.length);
    }, 1000);

    return () => {
      spinLoop.stop();
      dotsLoop.stop();
      clearInterval(interval);
      setMessageIndex(0);
      spinAnim.setValue(0);
    };
  }, [active, dots, spinAnim]);

  const rotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"]
  });

  const message = useMemo(() => AI_MESSAGES[messageIndex], [messageIndex]);

  if (!active) return null;

  return (
    <Container>
      <Spinner style={{ transform: [{ rotate }] }} />
      <MessageRow>
        <Message>{message}</Message>
        <Dots>
          {dots.map((dot, idx) => (
            <Dot key={idx} style={{ opacity: dot }}>
              .
            </Dot>
          ))}
        </Dots>
      </MessageRow>
    </Container>
  );
}

const Container = styled.View`
  padding: 24px;
  align-items: center;
  justify-content: center;
  gap: 14px;
`;

const Spinner = styled(Animated.View)`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  border-width: 3px;
  border-color: ${({ theme }) => theme.colors.bg4};
  border-top-color: ${({ theme }) => theme.colors.accent};
`;

const MessageRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Message = styled.Text`
  color: ${({ theme }) => theme.colors.text2};
  font-size: 14px;
`;

const Dots = styled.View`
  flex-direction: row;
`;

const Dot = styled(Animated.Text)`
  color: ${({ theme }) => theme.colors.text2};
  font-size: 18px;
  margin-left: 1px;
`;
