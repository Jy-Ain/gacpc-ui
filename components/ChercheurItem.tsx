import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Chercheur } from "../types/chercheur";

type Props = { chercheur: Chercheur };

export default function ChercheurItem({ chercheur }: Props) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: chercheur.photo }} style={styles.photo} />
      <View style={styles.info}>
        <Text style={styles.nom}>{chercheur.nom}</Text>
        <Text>{chercheur.specialite}</Text>
        <Text>{chercheur.diplome}</Text>
        <Text>{chercheur.adresse_mail}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  photo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  info: {
    marginLeft: 10,
    justifyContent: "center",
  },
  nom: {
    fontWeight: "bold",
    fontSize: 16,
  },
});
