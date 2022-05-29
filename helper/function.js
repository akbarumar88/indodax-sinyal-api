export const empty = (val) => {
  return (
    val == "" || val == null || val == undefined || val == false || val == 0
  )
}
