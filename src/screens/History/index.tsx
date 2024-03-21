import { useEffect, useRef, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { View, ScrollView, Alert } from 'react-native'
import { HouseLine, Trash } from 'phosphor-react-native'
import { Swipeable } from 'react-native-gesture-handler'

import { styles } from './styles'
import { THEME } from '../../styles/theme'
import { historyGetAll, historyRemove } from '../../storage/quizHistoryStorage'

import { Loading } from '../../components/Loading'
import { Header } from '../../components/Header'
import { HistoryCard, HistoryProps } from '../../components/HistoryCard'

export function History() {
  const [isLoading, setIsLoading] = useState(true)
  const [history, setHistory] = useState<HistoryProps[]>([])

  const { goBack } = useNavigation()

  const swipeableRefs = useRef<Swipeable[]>([])

  async function fetchHistory() {
    const response = await historyGetAll()
    setHistory(response)
    setIsLoading(false)
  }

  async function remove(id: string) {
    await historyRemove(id)

    fetchHistory()
  }

  function handleRemove(id: string, index: number) {
    swipeableRefs.current?.[index].close()

    Alert.alert('Remover', 'Deseja remover esse registro?', [
      {
        text: 'Sim',
        onPress: () => remove(id),
      },
      { text: 'Não', style: 'cancel' },
    ])
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  if (isLoading) {
    return <Loading />
  }

  return (
    <View style={styles.container}>
      <Header
        title="Histórico"
        subtitle={`Seu histórico de estudos${'\n'}realizados`}
        icon={HouseLine}
        onPress={goBack}
      />

      <ScrollView
        contentContainerStyle={styles.history}
        showsVerticalScrollIndicator={false}
      >
        {history.map((item, index) => (
          // O método de exclusão abaixo é feito somente puxando o componente para o lado direito
          <Swipeable
            ref={(ref) => {
              if (ref) {
                swipeableRefs.current.push(ref)
              }
            }}
            overshootLeft={false}
            containerStyle={styles.swipeableContainer}
            // Tamanho que será considera como aberto, se arrastar só um pouquinho não abre
            leftThreshold={10}
            // Garantindo que puxar do lado direito para o lado esquerdo não será feito nada
            renderRightActions={() => null}
            onSwipeableOpen={() => handleRemove(item.id, index)}
            renderLeftActions={() => (
              <View style={styles.swipeableRemove}>
                <Trash size={32} color={THEME.COLORS.GREY_100} />
              </View>
            )}
            key={item.id}
          >
            <HistoryCard data={item} />
          </Swipeable>

          // O método de exclusão abaixo é feito puxando o componente pro lado direito, aparecendo um botão de deletar e clicando nele.
          // <Swipeable
          //   ref={(ref) => {
          //     if (ref) {
          //       swipeableRefs.current.push(ref)
          //     }
          //   }}
          //   overshootLeft={false}
          //   containerStyle={styles.swipeableContainer}
          //   renderLeftActions={() => (
          //     <Pressable
          //       style={styles.swipeableRemove}
          //       onPress={() => handleRemove(item.id, index)}
          //     >
          //       <Trash size={32} color={THEME.COLORS.GREY_100} />
          //     </Pressable>
          //   )}
          //   key={item.id}
          // >
          //   <HistoryCard data={item} />
          // </Swipeable>
        ))}
      </ScrollView>
    </View>
  )
}
