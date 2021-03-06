class ResourceValidation
  @queue = :resource_validation
  
  def self.perform(current_user_id, content_partner_id, resource_id, port)
    partner = ContentPartner.find(content_partner_id, include: {resources: :resource_status })
    resource = partner.resources.find(resource_id)
    resource.upload_resource_to_content_master!(port)
    ResourceValidation.new.write_log_send_mail(current_user_id, resource_id)
  end
  
  def write_log_send_mail(user_id, resource_id)
    log = CuratorActivityLog.create!(user_id: user_id, changeable_object_type_id: ChangeableObjectType.resource_validation.id, 
           target_id: resource_id, activity: Activity.resource_validation)
    PendingNotification.create!(user_id: user_id, notification_frequency_id: NotificationFrequency.immediately.id, target: log, reason: 'auto_email_after_validation')
    Resque.enqueue(PrepareAndSendNotifications)    
  end
  
end