$ = jQuery

transformPattern = (pattern) ->
  return pattern.replace /\{0\}/g, '(\\d+)'


convertWorkDuration = (value) ->
  return 0 if value == '0'

  daysPattern = transformPattern t('work_duration.x_days')
  hoursPattern = transformPattern t('work_duration.x_hours')
  minutesPattern = transformPattern t('work_duration.x_minutes')

  days = value.match daysPattern
  hours = value.match hoursPattern
  minutes = value.match minutesPattern

  days = if days then +days[1] else 0
  hours = if hours then +hours[1] else 0
  minutes = if minutes then +minutes[1] else 0

  if !value
    value
  else
    (days * 8 + hours) * 60 + minutes


restoreWorkDuration = (value) ->
  return '0' if (value == '0' || value == 0)
  return value unless /^\d+$/.test value

  days = Math.floor(value / (8 * 60))
  hours = Math.floor((value - days * 8 * 60) / 60)
  minutes = value % 60
  result = []
  result.push t('work_duration.x_days').replace('{0}', days) if days > 0
  result.push t('work_duration.x_hours').replace('{0}', hours) if hours > 0
  result.push t('work_duration.x_minutes').replace('{0}', minutes) if minutes > 0
  result.join ' '


convertRating = (value) ->
  if /^[ABCDE]$/.test(value)
    value.charCodeAt(0) - 'A'.charCodeAt(0) + 1
  else
    value


convertValue = (value, input) ->
  type = input.data 'type'

  # No convertation if input doesn't have data-type
  return value unless type?

  # Do necessary convertion depeneds on input data-type
  switch type
    when 'WORK_DUR' then convertWorkDuration value
    when 'RATING' then convertRating value
    else value


restoreRating = (value) ->
  return value unless /^[12345]+$/.test value
  String.fromCharCode(value - 1 + 'A'.charCodeAt(0))


restoreValue = (value, input) ->
  type = input.data 'type'

  # No convertation if input doesn't have data-type
  return value unless type?

  # Do necessary convertion depeneds on input data-type
  switch type
    when 'WORK_DUR' then restoreWorkDuration value
    when 'RATING' then restoreRating value
    else value


originalVal = $.fn.val
$.fn.val = (value) ->
  if arguments.length
    originalVal.call @, (restoreValue value, @)
  else
    convertValue originalVal.call(@), @

$.fn.originalVal = originalVal

